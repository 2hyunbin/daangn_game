import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="game"
export default class extends Controller {
  static targets = ["grid", "score", "timer", "progressBar"]
  static values = {
    timeLimit: Number,
    score: Number
  }

  connect() {
    console.log('Game controller connected')
    this.timeLimitValue = 124 
    this.scoreValue = 0
    this.initializeGame()
    this.setupAudio()
  }

  initializeGame() {
    console.log('Game initialization started')
    this.selectedCells = new Set()
    this.createGrid()
    console.log('Starting timer...')
    this.startTimer()
    this.setupDragSelection()
  }

  createGrid() {
    const grid = this.gridTarget
    grid.innerHTML = ''
    
    // 일반 셀 생성
    const cells = [];
    for (let i = 0; i < 10; i++) { // 세로 10
      for (let j = 0; j < 17; j++) { // 가로 17
        const cell = document.createElement('div')
        cell.classList.add('cell')
        cell.dataset.value = Math.floor(Math.random() * 9) + 1
        cell.textContent = cell.dataset.value
        grid.appendChild(cell)
        cells.push(cell)
      }
    }
    
    // 10개의 셀을 랜덤하게 선택하여 special 클래스 추가
    this.addSpecialCells(cells, 10);
  }
  
  // 랜덤하게 n개의 셀에 special 클래스 추가
  addSpecialCells(cells, count) {
    const shuffled = [...cells].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    
    selected.forEach(cell => {
      cell.classList.add('special');
    });
  }

  startTimer() {
    let currentTime = this.timeLimitValue
    const totalTime = this.timeLimitValue
    
    this.timer = setInterval(() => {
      currentTime = currentTime - 0.3
      this.timeLimitValue = Math.floor(currentTime)
      this.timerTarget.textContent = this.formatTime(Math.floor(currentTime))
      
      // 진행 바 업데이트
      const progressPercentage = (currentTime / totalTime) * 100
      this.progressBarTarget.style.width = `${progressPercentage}%`
      
      if (currentTime <= 0) {
        this.endGame()
      }
    }, 300)
  }

  setupDragSelection() {
    let isSelecting = false
    let startCell = null
    let lastHoverCell = null

    // 마우스 이벤트에 대한 디버깅 로그 추가
    this.gridTarget.addEventListener('mousedown', (e) => {
      console.log('mousedown on', e.target, 'contains cell:', e.target.classList.contains('cell'), 'contains empty:', e.target.classList.contains('empty'));
      
      // 셀 클래스를 포함하는 모든 요소에 대해 드래그 시작
      if (e.target.classList.contains('cell')) {
        console.log('드래그 시작!');
        isSelecting = true
        this.clearSelection()
        startCell = e.target
        lastHoverCell = e.target
        this.selectRectangle(startCell, lastHoverCell)
      }
    })

    this.gridTarget.addEventListener('mousemove', (e) => {
      if (isSelecting && e.target.classList.contains('cell') && e.target !== lastHoverCell) {
        lastHoverCell = e.target
        this.clearSelection()
        this.selectRectangle(startCell, lastHoverCell)
      }
    })

    this.gridTarget.addEventListener('mouseup', () => {
      if (isSelecting) {
        this.checkSelection()
        isSelecting = false
        startCell = null
        lastHoverCell = null
      }
    })

    // 터치 이벤트 핸들러도 동일하게 수정
    this.gridTarget.addEventListener('touchstart', (e) => {
      console.log('touchstart on', e.target, 'contains cell:', e.target.classList.contains('cell'));
      
      if (e.target.classList.contains('cell')) {
        isSelecting = true
        this.clearSelection()
        startCell = e.target
        lastHoverCell = e.target
        this.selectRectangle(startCell, lastHoverCell)
        e.preventDefault();
      }
    })

    this.gridTarget.addEventListener('touchmove', (e) => {
      if (isSelecting) {
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element && element.classList.contains('cell') && element !== lastHoverCell) {
          lastHoverCell = element
          this.clearSelection()
          this.selectRectangle(startCell, lastHoverCell)
        }
        e.preventDefault();
      }
    })

    this.gridTarget.addEventListener('touchend', () => {
      if (isSelecting) {
        this.checkSelection()
        isSelecting = false
        startCell = null
        lastHoverCell = null
      }
    })
  }

  selectRectangle(startCell, endCell) {
    const cells = Array.from(this.gridTarget.querySelectorAll('.cell'))
    const gridWidth = 17

    const startIdx = cells.indexOf(startCell)
    const endIdx = cells.indexOf(endCell)
    
    if (startIdx === -1 || endIdx === -1) return

    const startRow = Math.floor(startIdx / gridWidth)
    const startCol = startIdx % gridWidth
    const endRow = Math.floor(endIdx / gridWidth)
    const endCol = endIdx % gridWidth

    const minRow = Math.min(startRow, endRow)
    const maxRow = Math.max(startRow, endRow)
    const minCol = Math.min(startCol, endCol)
    const maxCol = Math.max(startCol, endCol)

    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const cellIdx = row * gridWidth + col
        if (cellIdx >= 0 && cellIdx < cells.length) {
          this.addToSelection(cells[cellIdx])
        }
      }
    }
  }

  addToSelection(cell) {
    cell.classList.add('selected')
    this.selectedCells.add(cell)
    console.log(this.selectedCells);
  }

  clearSelection() {
    document.querySelectorAll('.cell.selected').forEach(cell => {
      cell.classList.remove('selected')
    })
    this.selectedCells.clear()
  }

  checkSelection() {
    const sum = Array.from(this.selectedCells).reduce((total, cell) => {
      const value = parseInt(cell.dataset.value) || 0;
      return total + value;
    }, 0);

    // 선택된 셀 중 값이 0이 아닌 셀만 계산
    const nonEmptyCells = Array.from(this.selectedCells).filter(cell => 
      parseInt(cell.dataset.value) > 0
    );

    if (sum === 10 && nonEmptyCells.length > 0) {
      // 특별 셀(당근)이 포함되어 있는지 확인
      const specialCells = Array.from(this.selectedCells).filter(cell => 
        cell.classList.contains('special') && parseInt(cell.dataset.value) > 0
      );
      
      const regularPoints = nonEmptyCells.length;
      const specialPoints = specialCells.length * 4; // 특별 셀당 4점 추가
      const totalPoints = regularPoints + specialPoints;
      
      this.removeSelectedCells();
      this.updateScore(totalPoints);
      
      // 특별 셀이 제거되었을 때 효과 표시 (선택 사항)
      if (specialCells.length > 0) {
        this.showSpecialEffect(specialPoints);
      }
    }
    this.clearSelection();
  }

  removeSelectedCells() {
    this.selectedCells.forEach(cell => {
      cell.classList.add('removed')
      setTimeout(() => {
        cell.dataset.value = '0'
        cell.textContent = ''
        cell.classList.add('empty')
      }, 300)
    })
  }

  updateScore(points) {
    this.scoreValue += points
    this.scoreTarget.textContent = this.scoreValue
  }

  endGame() {
    clearInterval(this.timer)
    // 진행 바를 0%로 설정
    this.progressBarTarget.style.width = '0%'
    this.saveScore()
    this.showGameOver()
  }

  saveScore() {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content
    
    fetch('/players', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({
        player: {
          score: this.scoreValue,
          nickname: localStorage.getItem('nickname'),
          region: localStorage.getItem('region')
        }
      })
    })
  }

  showGameOver() {
    const nickname = localStorage.getItem('nickname')
    const region = localStorage.getItem('region')
    window.location.href = `/games/rankings?score=${this.scoreValue}&nickname=${encodeURIComponent(nickname)}&region=${encodeURIComponent(region)}`
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // 특별 점수 획득 효과 표시 (선택 사항)
  showSpecialEffect(points) {
    const effectEl = document.createElement('div');
    effectEl.classList.add('special-effect');
    effectEl.textContent = `+${points}`;
    this.element.appendChild(effectEl);
    
    setTimeout(() => {
      effectEl.remove();
    }, 1000);
  }

  // 음악 설정
  setupAudio() {
    const bgMusic = document.getElementById('bgMusic')
    const toggleButton = document.getElementById('toggleAudio')
    const volumeSlider = document.getElementById('volumeSlider')
    
    bgMusic.volume = 0.5 // 기본 볼륨
    
    // 음악 상태 복원
    const isMuted = localStorage.getItem('gameMuted') === 'true'
    const volume = localStorage.getItem('gameVolume')
    
    if (isMuted) {
      bgMusic.muted = true
      toggleButton.textContent = '🔇'
    } else {
      bgMusic.muted = false
      toggleButton.textContent = '🔊'
    }
    
    if (volume) {
      bgMusic.volume = parseFloat(volume)
      volumeSlider.value = volume
    }
    
    // 게임 시작시 자동 재생 (사용자 인터랙션 필요)
    toggleButton.addEventListener('click', () => {
      if (bgMusic.paused) {
        bgMusic.play()
        bgMusic.muted = false
        toggleButton.textContent = '🔊'
        localStorage.setItem('gameMuted', 'false')
      } else {
        if (bgMusic.muted) {
          bgMusic.muted = false
          toggleButton.textContent = '🔊'
          localStorage.setItem('gameMuted', 'false')
        } else {
          bgMusic.muted = true
          toggleButton.textContent = '🔇'
          localStorage.setItem('gameMuted', 'true')
        }
      }
    })
    
    // 볼륨 조절
    volumeSlider.addEventListener('input', () => {
      bgMusic.volume = volumeSlider.value
      localStorage.setItem('gameVolume', volumeSlider.value)
      
      // 볼륨이 0이면 음소거 아이콘으로 변경
      if (parseFloat(volumeSlider.value) === 0) {
        toggleButton.textContent = '🔇'
        bgMusic.muted = true
        localStorage.setItem('gameMuted', 'true')
      } else if (bgMusic.muted) {
        toggleButton.textContent = '🔊'
        bgMusic.muted = false
        localStorage.setItem('gameMuted', 'false')
      }
    })
  }
}

