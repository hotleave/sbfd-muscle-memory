(function () {
  const settings = { theme: 'system', showHint: false, content: ['part'] }
  let settingData = localStorage.getItem('settings')
  if (settingData) {
    Object.assign(settings, JSON.parse(settingData))
  }

  const darkModeQuery = window.matchMedia('(prefers-color-scheme: light)');

  let sm = null
  let current = null
  let startTime = 0
  let fail = 0
  let input = ''

  const getData = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error when loading data');
      }
      return await response.json();
    } catch (error) {
      console.error('Fetch error when loading data', error);
    }
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

  const _makeCards = async () => {
    const promises = settings.content.map(type => getData(`../data/${type}.json`))
    const datas = await Promise.all(promises)

    const cards = []
    datas.forEach(data => {
      const part = data['_type'] === 'part'
      if (part) {
        delete data['_type']
      }

      for (const key of Object.keys(data)) {
        const back = key
        if (part) {
          const parts = data[key]
          for (let i = parts.length - 1; i >= 0; i--) {
            let front = parts.charAt(i)
            cards.push({ front, back, part })
          }
        } else {
          const front = data[key]
          cards.push({ front, back, part })
        }
      }
    })
    shuffle(cards)

    sm = new SM()
    for (const card of cards) {
      sm.addItem(card)
    }

    _next()
  }

  const _next = () => {
    if (!sm) {
      return
    }

    current = sm.nextItem()
    if (current) {
      const { front, back } = current.value

      const classList = document.querySelector('.card').classList
      classList.toggle('double', front.length === 2)
      classList.toggle('part', current.value.part)
      document.querySelector('.card-front').innerHTML = front === '告' ? '<span class="icon">&#xe800;</span>' : front
      document.querySelector('.card-back').innerHTML = back
      startTime = performance.now()
      fail = 0
      _updateInput('')

      _updateRemained()
    } else if (sm.q.length > 0) {
      save()
      alert(`今日训练任务已完成，下一张卡牌的训练时间是：${sm.q[0].dueDate.toLocaleString()}`)
    }
  }

  const _grade = () => {
    if (fail > 0) {
      return Math.max(0, 3 - fail)
    }

    const elapsed = performance.now() - startTime
    if (elapsed < 600) {
      // very good
      return 5
    }

    if (elapsed < 1000) {
      // good
      return 4
    }

    // normal
    return 3
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

    _next()
  }

  const answer = (grade, item) => {
    sm.answer(grade, item)
  }

  /**
   * 重新开始
   */
  const restart = () => {
    _makeCards()
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

    const remove = confirm(`确认要删除 "${current.value.front}(${current.value.back})" 吗？`)
    if (remove) {
      sm.discard(current)
      _next()
    }
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

  const _updateRemained = () => {
    const now = Date.now()
    const remained = sm.q.filter(v => v.dueDate.getTime() <= now).length
    document.querySelector('.card-number').innerText = remained
  }

  const _updateInput  = (value) => {
    input = value
    document.querySelector('.answer').innerText = input
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
      'Escape': (e) => { 
        e.preventDefault()
        _updateInput('')
      },
      'Del': discard,
      '?': shortcut
    }

    // 按键事件
    document.addEventListener('keyup', e => {
      const callback = handlers[e.key]
      if (callback) {
        callback.call(this, e)
      }
    })

    document.addEventListener('keypress', e => {
      e.preventDefault()
      if (!current) {
        return
      }

      const expect = current.value.back
      let correct = false
      if (e.key.length === 1) {
        _updateInput(input + e.key.toLowerCase())
      }
      if (input.length >= expect.length) {
        correct = input === expect
      } else {
        return
      }

      if (correct) {
        // input is correct
        if (!settings.showHint) {
          document.querySelector('.card').removeAttribute('style')
        }
        answer(_grade(), current)
        _next()
      } else {
        fail++

        if (expect.length === 1) {
          // 如果只有一个按键，则自动重置
          _updateInput('')
        }

        if (!settings.showHint && fail >= 3) {
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

      if (location.pathname === '/') {
        document.querySelector('#home').style.display = 'none';
      }

      document.querySelector('.card input').addEventListener('composing', e => {
        e.preventDefault()
      })
      document.querySelector('main').addEventListener('click', (e) => {
        document.querySelector('.card input').focus()
      })

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
        if (e.target.id === 'show-hint') {
          return
        }

        if (e.target.name === 'theme-mode') {
          settings.theme = e.target.value
          localStorage.setItem('settings', JSON.stringify(settings))

          if (settings.theme === 'system') {
            document.querySelector('html').classList.toggle('light', darkModeQuery.matches)
          } else {
            document.querySelector('html').classList.toggle('light', settings.theme === 'light')
          }
        }

        if (e.target.name === 'content') {
          const content = []
          document.querySelectorAll('input[name=content]:checked').forEach(v => content.push(v.value))
          if (content.length === 0) {
            e.target.checked = true
            return
          }

          settings.content = content
          localStorage.setItem('settings', JSON.stringify(settings))
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
  settings.content.forEach(v => {
    document.querySelector(`input[value=${v}]`).checked = true
  })

  attachEvent()
})()