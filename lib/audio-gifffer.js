;(function webpackUniversalModuleDefinition(root, factory) {
  if (typeof exports === 'object' && typeof module === 'object')
    module.exports = factory()
  else if (typeof define === 'function' && define.amd)
    define('Gifffer', [], factory)
  else if (typeof exports === 'object') exports['Gifffer'] = factory()
  else root['Gifffer'] = factory()
})(this, function() {
  // Check if running in client
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }
  var d = document
  var playSize = 60

  var Gifffer = function(options) {
    var images,
      i = 0,
      gifs = []

    images = d.querySelectorAll('[data-gifffer]')
    for (; i < images.length; ++i) process(images[i], gifs, options)
    // returns each gif container to be usable programmatically
    return gifs
  }

  function formatUnit(v) {
    return v + (v.toString().indexOf('%') > 0 ? '' : 'px')
  }

  function parseStyles(styles) {
    var stylesStr = ''
    for (prop in styles) stylesStr += prop + ':' + styles[prop] + ';'
    return stylesStr
  }

  function createContainer(w, h, el, altText, opts) {
    var alt
    var con = d.createElement('BUTTON')
    var cls = el.getAttribute('class')
    var id = el.getAttribute('id')
    var playButtonStyles =
      opts && opts.playButtonStyles
        ? parseStyles(opts.playButtonStyles)
        : [
            'width:' + playSize + 'px',
            'height:' + playSize + 'px',
            'border-radius:' + playSize / 2 + 'px',
            'background:rgba(0, 0, 0, 0.3)',
            'position:absolute',
            'top:50%',
            'left:50%',
            'margin:-' + playSize / 2 + 'px'
          ].join(';')
    var playButtonIconStyles =
      opts && opts.playButtonIconStyles
        ? parseStyles(opts.playButtonIconStyles)
        : [
            'width: 0',
            'height: 0',
            'border-top: 14px solid transparent',
            'border-bottom: 14px solid transparent',
            'border-left: 14px solid rgba(0, 0, 0, 0.5)',
            'position: absolute',
            'left: 26px',
            'top: 16px'
          ].join(';')

    cls ? con.setAttribute('class', el.getAttribute('class')) : null
    id ? con.setAttribute('id', el.getAttribute('id')) : null
    con.setAttribute(
      'style',
      'position:relative;cursor:pointer;background:none;border:none;padding:0;'
    )
    con.setAttribute('aria-hidden', 'true')

    // creating play button
    var play = d.createElement('DIV')
    play.setAttribute('class', 'gifffer-play-button')
    play.setAttribute('style', playButtonStyles)

    var trngl = d.createElement('DIV')
    trngl.setAttribute('style', playButtonIconStyles)
    play.appendChild(trngl)

    // create alt text if available
    if (altText) {
      alt = d.createElement('p')
      alt.setAttribute('class', 'gifffer-alt')
      alt.setAttribute(
        'style',
        'border:0;clip:rect(0 0 0 0);height:1px;overflow:hidden;padding:0;position:absolute;width:1px;'
      )
      alt.innerText = altText + ', image'
    }

    // dom placement
    con.appendChild(play)
    el.parentNode.replaceChild(con, el)
    altText ? con.parentNode.insertBefore(alt, con.nextSibling) : null
    return { c: con, p: play }
  }

  function calculatePercentageDim(el, w, h, wOrig, hOrig) {
    var parentDimW = el.parentNode.offsetWidth
    var parentDimH = el.parentNode.offsetHeight
    var ratio = wOrig / hOrig

    if (w.toString().indexOf('%') > 0) {
      w = parseInt(w.toString().replace('%', ''))
      w = (w / 100) * parentDimW
      h = w / ratio
    } else if (h.toString().indexOf('%') > 0) {
      h = parseInt(h.toString().replace('%', ''))
      h = (h / 100) * parentDimW
      w = h * ratio
    }

    return { w: w, h: h }
  }

  function process(el, gifs, options) {
    var url,
      audioUrl,
      audioFormat,
      con,
      c,
      w,
      h,
      duration,
      play,
      gif,
      playing = false,
      cc,
      isC,
      durationTimeout,
      dims,
      altText,
      sound

    url = el.getAttribute('data-gifffer')
    audioUrl = el.getAttribute('audio-data-gifffer')
    audioFormat = el.getAttribute('audio-gifffer-format')
    w = el.getAttribute('data-gifffer-width')
    h = el.getAttribute('data-gifffer-height')
    duration = el.getAttribute('data-gifffer-duration')
    altText = el.getAttribute('data-gifffer-alt')
    el.style.display = 'block'
    
    sound      = document.createElement('audio');
    sound.controls = 'hidden';
    sound.src      = audioUrl
    sound.type     = audioFormat;
    sound.style.display = 'none'
    sound.loop = true;


    // creating the canvas
    c = document.createElement('canvas')
    isC = !!(c.getContext && c.getContext('2d'))
    if (w && h && isC) cc = createContainer(w, h, el, altText, options)

    // waiting for image load
    el.onload = function() {
      if (!isC) return

      w = w || el.width
      h = h || el.height

      // creating the container
      if (!cc) cc = createContainer(w, h, el, altText, options)
      con = cc.c
      play = cc.p
      dims = calculatePercentageDim(con, w, h, el.width, el.height)
      con.appendChild(sound)

      // add the container to the gif arraylist
      gifs.push(con)

      // listening for image click
      con.addEventListener('click', function() {
        clearTimeout(durationTimeout)
        if (!playing) {
          playing = true
          gif = document.createElement('IMG')
          gif.setAttribute('style', 'width:100%;height:100%;')
          gif.setAttribute('data-uri', Math.floor(Math.random() * 100000) + 1)
          setTimeout(function() {
            gif.src = url
          }, 0)
          con.removeChild(play)
          con.removeChild(c)
          con.appendChild(gif)
          sound.play()
          if (parseInt(duration) > 0) {
            durationTimeout = setTimeout(function() {
              playing = false
              con.appendChild(play)
              con.removeChild(gif)
              con.appendChild(c)
              gif = null
            }, duration)
          }
        } else {
          playing = false
          con.appendChild(play)
          con.removeChild(gif)
          sound.pause()
          con.appendChild(c)
          gif = null
        }
      })

      // canvas
      c.width = dims.w
      c.height = dims.h
      c.getContext('2d').drawImage(el, 0, 0, dims.w, dims.h)
      con.appendChild(c)

      // setting the actual image size
      con.setAttribute(
        'style',
        'position:relative;cursor:pointer;width:' +
          dims.w +
          'px;height:' +
          dims.h +
          'px;background:none;border:none;padding:0;'
      )

      c.style.width = '100%'
      c.style.height = '100%'

      if (w.toString().indexOf('%') > 0 && h.toString().indexOf('%') > 0) {
        con.style.width = w
        con.style.height = h
      } else if (w.toString().indexOf('%') > 0) {
        con.style.width = w
        con.style.height = 'inherit'
      } else if (h.toString().indexOf('%') > 0) {
        con.style.width = 'inherit'
        con.style.height = h
      } else {
        con.style.width = dims.w + 'px'
        con.style.height = dims.h + 'px'
      }
    }
    el.src = url
  }

  return Gifffer
})
