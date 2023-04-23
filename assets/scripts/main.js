$(function () {
  const bounds = new L.LatLngBounds(
    new L.LatLng(-49.875, 34.25),
    new L.LatLng(-206, 221)
  )
  const map = L.map('mapContainer', {
    crs: L.CRS.Simple,
    attributionControl: false,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0,
  }).setView([0, 0], 2)
  const layer = L.tileLayer('assets/maps/{z}_{x}_{y}.png', {
    attribution: '&copy; David',
    minZoom: 2,
    maxZoom: 7,
    noWrap: true,
    bounds: bounds,
  }).addTo(map)

  console.log('layer', layer)
  layer.on('tileload', () => {
    console.log('tileload 当瓦片加载时触发')
  })

  const markerStyle = {}
  const visibleMarker = {}
  let css = ''
  const typeChinese = {
    quest: '任务',
    miniboss: '头目',
    treasure: '宝箱',
    shrine: '神庙',
    stable: '马宿',
    tower: '塔',
    town: '城镇',
    'great-fairy-fountain': '大精灵',
    'korok-seed': '种子',
    memory: '记忆',
  }
  const listContainer = $('#switchType ul')
  $('<li>').attr('data-type', 'all').text('全部').appendTo(listContainer)
  $('<li>').attr('data-type', 'none').text('无').appendTo(listContainer)
  console.log(markerCatalog, 'markerCatalog')
  $.each(markerCatalog, function () {
    const name = this.name
    $('<li>')
      .text(typeChinese[name] || name)
      .appendTo(listContainer)
      .addClass('title')
    $.each(this.children, function () {
      const name = this.name
      $('<li>')
        .attr('data-type', this.id)
        .text(typeChinese[name] || name)
        .appendTo(listContainer)
        .addClass('icon-' + this.img)
      markerStyle[this.id] = this.img
      visibleMarker[this.id] = false
      css +=
        '.icon-' +
        this.img +
        ', .icon-' +
        this.img +
        ':after {background-color:' +
        this.color +
        ';}'
    })
  })
  $('<style>').text(css).insertBefore($('head').find('*')[0])
  $('#switchType li').click(function () {
    if ($(this).attr('data-type')) toggleVisible($(this).attr('data-type'))
  })
  function toggleVisible(type) {
    if (type === 'all' || type === 'none') {
      for (let o in visibleMarker) {
        if (visibleMarker.hasOwnProperty(o)) {
          visibleMarker[o] = type === 'all' ? true : false
        }
      }
    } else {
      if (event.ctrlKey) {
        if (visibleMarker[type]) {
          visibleMarker[type] = false
        } else {
          visibleMarker[type] = true
        }
      } else {
        for (let p in visibleMarker) {
          if (visibleMarker.hasOwnProperty(p)) {
            visibleMarker[p] = false
          }
        }
        visibleMarker[type] = true
      }
    }
    refreshFilter()
    refreshMarker('filter')
  }
  function refreshFilter() {
    let allVisible = true
    let allHidden = true
    for (var o in visibleMarker) {
      if (visibleMarker.hasOwnProperty(o)) {
        if (!visibleMarker[o]) {
          allVisible = false
        } else {
          allHidden = false
        }
      }
    }
    $('#switchType li').removeClass('current')
    if (allVisible) {
      $('#switchType li[data-type=all]').addClass('current')
    } else if (allHidden) {
      $('#switchType li[data-type=none]').addClass('current')
    } else {
      for (let p in visibleMarker) {
        if (visibleMarker.hasOwnProperty(p)) {
          if (visibleMarker[p]) {
            $("#switchType li[data-type='" + p + "']").addClass('current')
          }
        }
      }
    }
  }
  let cacheMarker = []
  function refreshMarker(from) {
    $.each(cacheMarker, function () {
      this.remove()
    })
    cacheMarker = []
    $.each(markerData, function () {
      let visible = false
      if (from === 'filter' && visibleMarker[this.markerCategoryId])
        visible = true
      if (from === 'search') {
        const keyword = $('#keywords').val()
        if (
          this.name
            .toLowerCase()
            .replace(/^\s+|\s+$/g, '')
            .indexOf(keyword.toLowerCase().replace(/^\s+|\s+$/, '')) !== -1
        )
          visible = true
        if (
          this.description
            .toLowerCase()
            .replace(/^\s+|\s+$/g, '')
            .indexOf(keyword.toLowerCase().replace(/^\s+|\s+$/, '')) !== -1
        )
          visible = true
      }
      if (visible) {
        const key =
          this.markerCategoryId +
          '-' +
          this.id +
          '-' +
          this.name.replace(/[^A-Z]/gi, '-')
        let popupHtml = '<div class="popupContainer">'
        popupHtml += '<strong class="name">' + this.name + '</strong>'
        popupHtml += '<div class="buttonContainer">'
        popupHtml +=
          '<span class="markButton" onclick="changeMarkPoint(this)" data-key="' +
          key +
          '">标记</span>'
        popupHtml +=
          '<a class="markButton" target="_blank" href="http://www.ign.com/search?q=' +
          encodeURIComponent(this.name) +
          '">IGN</a>'
        popupHtml +=
          '<a class="markButton" target="_blank" href="http://www.polygon.com/search?q=' +
          encodeURIComponent(this.name) +
          '">Polygon</a>'
        popupHtml +=
          '<a class="markButton" target="_blank" href="https://c.gufen.ga/#q=' +
          encodeURIComponent(this.name) +
          '">Google</a>'
        popupHtml +=
          '<a class="markButton" target="_blank" href="http://www.baidu.com/baidu?word=' +
          encodeURIComponent(this.name) +
          '">百度</a>'
        popupHtml += '</div>'
        if (this.markerCategoryId === '1925') {
          if (shrinesToJapanese[this.name]) {
            const jName = shrinesToJapanese[this.name]
            popupHtml += '<strong class="name">' + jName + '</strong>'
            popupHtml += '<div class="buttonContainer">'
            popupHtml +=
              '<a class="markButton" target="_blank" href="https://zelda-bow.gamepedia.jp/?s=' +
              jName +
              '">GamePedia</a>'
            popupHtml +=
              '<a class="markButton" target="_blank" href="http://wiki2.h1g.jp/zelda_bow/index.php?' +
              jName +
              '">H1G</a>'
            popupHtml +=
              '<a class="markButton" target="_blank" href="https://c.gufen.ga/#q=' +
              jName +
              '">Google</a>'
            popupHtml +=
              '<a class="markButton" target="_blank" href="http://www.baidu.com/baidu?word=' +
              jName +
              '">百度</a>'
            popupHtml += '</div>'
          } else {
            console.log('no find shrine janpanese: ' + this.name)
          }
        }
        popupHtml += '</div>'
        let className = 'mark-' + key
        if (localStorage.getItem(key)) {
          className += ' marked'
        }
        className += ' markIcon'
        className += ' icon-' + markerStyle[this.markerCategoryId]
        const marker = L.marker([this.y, this.x], {
          title: this.name,
          icon: L.divIcon({
            className: className,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -10],
          }),
        })
          .addTo(map)
          .bindPopup(popupHtml)
        cacheMarker.push(marker)
      }
    })
  }
  toggleVisible('1925')
  let lastKeyworld = ''
  setInterval(function () {
    const newKeyword = $('#keywords').val()
    if (newKeyword !== lastKeyworld) {
      if (newKeyword) {
        lastKeyworld = newKeyword
        refreshMarker('search')
      } else {
        refreshMarker('filter')
      }
    }
  }, 500)
  $('#clearKeyword').click(function () {
    $('#keywords').val('')
  })

  map.on('click', onMapClick)
  function onMapClick(e) {
    console.log(e, this)
    // TODO: 限制点击在有图的地图上
    if (currentMarker) {
      currentMarker.remove()
    }
    // containerPoint: L.Point {x: 614, y: 480} // 鼠标事件发生的点相对于地图容器的像素坐标
    // latlng: L.LatLng {lat: -131, lng: 132} // 鼠标事件发生的地理坐标
    // layerPoint: L.Point {x: 614, y: 480} // 鼠标事件发生点相对于地图图层的像素坐标
    const { containerPoint, latlng, layerPoint } = e
    // const { x,y} = containerPoint
    // const { x,y} = layerPoint
    const { lat: x, lng: y } = latlng
    const className =
      'leaflet-marker-icon mark-1925-2914-Sah-Dahaj-Shrine markIcon icon-BotW_Shrines '
    const marker = L.marker([x, y], {
      title: 'test',
      icon: L.divIcon({
        className: className,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10],
      }),
      draggable: true,
    }).addTo(map)
    this.marker = marker
    const popup = marker.bindPopup(
      '<div><button id="" onclick="addPoint(this)">确定</button><button id="" onclick="cancelPoint(this)">取消</button></div>'
    )
    popup.openPopup()
    currentMarker = marker
    marker.on('dragend', (e) => {
      console.log(e, 'dragend')
      popup.openPopup()
    })
  }
})

let currentMarker = null

// 标记/去除标记
function changeMarkPoint(element) {
  const that = $(element)
  const key = that.attr('data-key')
  const oldValue = localStorage.getItem(key)
  const newValue = !oldValue
  localStorage.setItem(key, newValue ? '1' : '')
  $('#mapContainer .leaflet-marker-pane .mark-' + key).toggleClass(
    'marked',
    newValue
  )
}

function addPoint(element) {
  // 禁用拖拽
  currentMarker.dragging.disable()
  // 关闭popup
  currentMarker.closePopup()
  // 重新渲染popup样式
  currentMarker.unbindPopup()
  currentMarker.bindPopup('123')
  // 保存到本地
  let customMarkers = []
  try {
    const str = localStorage.getItem('customMarkers')
    customMarkers = JSON.parse(str)
    if (!Array.isArray(customMarkers)) {
      customMarkers = []
    }
  } catch {
    localStorage.removeItem('customMarkers')
  }
  const { _latlng } = currentMarker
  customMarkers.push({
    id: new Date().getTime(),
    markerCategoryId: '1925', // 分类
    markerCategoryTypeId: '1',
    userName: '',
    name: '测试', // 标题
    description: '123',
    x: _latlng.lng,
    y: _latlng.lat,
    visible: '1',
  })
  localStorage.setItem('customMarkers', JSON.stringify(customMarkers))
}
function cancelPoint(element) {
  currentMarker.closePopup()
  currentMarker.remove()
}
