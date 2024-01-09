(function () {
  const settings = { theme: 'system', showHint: false }
  let settingData = localStorage.getItem('settings')
  if (settingData) {
    Object.assign(settings, JSON.parse(settingData))
  }

  const darkModeQuery = window.matchMedia('(prefers-color-scheme: light)');

  let sm = null
  let current = null
  let startTime = 0
  let fail = false

  const data = {
    'q': '气欠犬犭青其日曰攴',
    'w': '韦文瓦王攵夂夊亠韋',
    'r': '人亻',
    't': '田土士',
    'y': '又用业页頁衣羊言讠音酉尢疋',
    'p': '片皮⺮丿彡',
    's': '十山尸手水石矢舌身鼠示食饣飠殳豕丨厶',
    'd': '刀大歹斗鬥豆丶冫氵癶',
    'f': '方风風父缶扌',
    'g': '工弓广戈瓜革鬼骨艮宀冖',
    'h': '一户火禾黑虍',
    'j': '几己巾斤见見臼角金钅釒纟糹',
    'k': '口囗匚凵冂',
    'l': '力立龙龍里鹿耒刂忄廴辶灬卤鹵',
    'z': '乙子舟自走豸隹足⻊爪爫丬爿罒長巛',
    'x': '夕小心穴血覀辛彐糸⺍⺌',
    'c': '厂寸车車虫赤辰齿齒彳艹卝屮',
    'v': '二儿耳月羽鱼魚雨聿阝卩',
    'b': '八比贝貝白鼻卜髟勹疒丷',
    // 告 只取上半部分，即牛字头
    'n': '女牛告鸟鳥衤礻廾止',
    'm': '马馬门門毛木皿目麻米麦麥母毋毌',
  }

  const shuffle = (array) => {
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }

  const _makeCards = () => {
    const cards = []
    for (const key of Object.keys(data)) {
      const back = key
      const parts = data[key]
      for (let i = parts.length - 1; i >= 0; i--) {
        let front = parts.charAt(i)
        cards.push({ front, back })
      }
    }
    shuffle(cards)

    sm = new SM()
    for (const card of cards) {
      sm.addItem(card)
    }
  }

  const _next = () => {
    if (!sm) {
      return
    }

    current = sm.nextItem()
    if (current) {
      const { front, back } = current.value

      document.querySelector('.card-front').innerHTML = front === '告' ? '<span class="icon">&#xe800;</span>' : front
      document.querySelector('.card-back').innerHTML = back
      startTime = performance.now()
    } else if (sm.q.length > 0) {
      save()
      alert('今日训练任务已完成，明日再来')
    }
  }

  const _grade = () => {
    if (fail) {
      fail = false
      return 0
    }

    const elapsed = performance.now - startTime
    if (elapsed < 200) {
      // very good
      return 5
    }

    if (elapsed < 300) {
      // good
      return 4
    }

    if (elapsed < 500) {
      // normal
      return 3
    }

    if (elapsed < 1000) {
      // need improve
      return 2
    }

    // bad
    return 1
  }

  const _tomorrow = () => {
    let result = new Date()
    result.setHours(0, 0, 0, 0)
    result.setTime(result.getTime() + 86400000)

    return result
  }

  const load = () => {
    const json = localStorage.getItem('super-memo-data')
    if (!json) {
      // make cards automatically
      _makeCards()
      return
    }

    const data = JSON.parse(json)
    sm = SM.load(data)
    if (current) {
      current = null
      document.querySelector('.card-front').innerHTML = ''
      document.querySelector('.card-back').innerHTML = ''
    }
  }

  const answer = (grade, item) => {
    sm.answer(grade, item, _tomorrow())
  }

  /**
   * 重新开始
   */
  const restart = () => {
    _makeCards()
    _next()
  }

  /**
   * 保存
   */
  const save = () => {
    if (!sm) {
      return
    }

    const data = sm.data()
    localStorage.setItem('super-memo-data', JSON.stringify(data))
  }

  /**
   * 丢弃卡牌
   */
  const discard = () => {
    if (!current) {
      return
    }

    sm.discard(current)
    _next()
  }

  const shortcut = () => {
    const shown = document.querySelector('.content.visiable')
    if (shown && shown.id !== 'shortcut-content') {
      shown.classList.remove('visiable')
    }
    const visiable = document.querySelector('#shortcut-content').classList.toggle('visiable')
    document.querySelector('.card').classList.toggle('visiable', !visiable)
  }

  const toggleTheme = (newTheme) => {
    let list = document.querySelector('html').classList
    const oldTheme = list.contains('light') ? 'light' : 'dark'
    if (oldTheme === newTheme) {
      return
    }

    list.toggle('light')
    const newValue = oldTheme == 'light' ? 'dark' : 'light'
    document.querySelector(`input[value=${newValue}]`).checked = true

    settings.theme = newValue
    localStorage.setItem('settings', JSON.stringify(settings))
  }

  const setup = () => {
    const shown = document.querySelector('.content.visiable')
    if (shown && shown.id !== 'setup-content') {
      shown.classList.remove('visiable')
    }

    const visiable = document.querySelector('#setup-content').classList.toggle('visiable')
    document.querySelector('.card').classList.toggle('visiable', !visiable)
  }

  const about = () => {
    const shown = document.querySelector('.content.visiable')
    if (shown && shown.id !== 'about-content') {
      shown.classList.remove('visiable')
    }

    const visiable = document.querySelector('#about-content').classList.toggle('visiable')
    document.querySelector('.card').classList.toggle('visiable', !visiable)
  }

  const attachEvent = () => {
    const handlers = {
      'F1': about,
      'F2': setup,
      'F3': toggleTheme,
      'F8': load,
      'F9': restart,
      'F10': save,
      'Backspace': discard,
      'Delete': discard,
      'Escape': discard,
      'Del': discard,
      '?': shortcut
    }

    // 按键事件
    document.addEventListener('keyup', e => {
      const callback = e.key === ' ' ? _next : handlers[e.key]
      if (callback) {
        callback.apply(e)
      }
    })

    document.addEventListener('keypress', e => {
      e.preventDefault()
      if (!current) {
        return
      }

      if (current.value.back === e.key.toLowerCase()) {
        // input is correct
        if (!settings.showHint) {
          document.querySelector('.card').removeAttribute('style')
        }
        answer(_grade(), current)
        _next()
      } else {
        fail = true

        if (!settings.showHint) {
          document.querySelector('.card').setAttribute('style', '--show-hint: inline-block;')
        }
      }
    })

    // 页面加载时自动读取进度
    window.addEventListener('load', e => {
      load()

      document.querySelector('#show-hint').checked = settings.showHint
      if (settings.showHint) {
        document.querySelector('.card').setAttribute('style', '--show-hint: inline-block;')
      }

      // 帮助 F1
      document.querySelector('#about').addEventListener('click', about)
      // 设置 F2
      document.querySelector('#setup').addEventListener('click', setup)
      // 主题 F3
      document.querySelector('#theme').addEventListener('click', toggleTheme)
      // 重新开始 F9
      document.querySelector('#restart').addEventListener('click', restart)
      // 丢弃 Backspace/Delete
      document.querySelector('#discard').addEventListener('click', discard)
      // 快捷键 ?
      document.querySelector('#shortcut').addEventListener('click', shortcut)

      // 提示设置变化
      document.querySelector('#show-hint').addEventListener('change', e => {
        const show = settings.showHint = e.target.checked
        if (show) {
          document.querySelector('.card').setAttribute('style', '--show-hint: inline-block;')
        } else {
          document.querySelector('.card').removeAttribute('style')
        }
        localStorage.setItem('settings', JSON.stringify(settings))
      })

      // 主题设置变化
      document.querySelector('#setup-content').addEventListener('change', e => {
        settings.theme = e.target.value
        localStorage.setItem('settings', JSON.stringify(settings))

        if (settings.theme === 'system') {
          document.querySelector('html').classList.toggle('light', darkModeQuery.matches)
        } else {
          document.querySelector('html').classList.toggle('light', settings.theme === 'light')
        }
      })

      // register service worker
      navigator.serviceWorker.register('/scripts/service.js')
        .then(reg => {
          reg.update()
          console.log('Service Worker 注册成功')
        })
    })
    // 离开页面时自动保存
    window.addEventListener('unload', save)

    darkModeQuery.addEventListener('change', (e) => {
      if (settings.theme === 'system') {
        toggleTheme(e.matches ? 'light' : 'dark')
      }
    })
  }

  toggleTheme(settings.theme === 'system' ? (darkModeQuery.matches ? 'light' : 'dark') : settings.theme)

  attachEvent()
})()