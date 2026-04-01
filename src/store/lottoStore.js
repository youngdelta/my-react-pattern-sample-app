import { create } from 'zustand';

const useLottoStore = create((set) => ({
  lottoNumbers: [],
  bonusNumber: 0,
  historyLottoNumbers: [],
  isDarkMode: localStorage.getItem('isDarkMode') === 'true',

  // 로또 번호 생성 (6개, 중복 없음, 히스토리에 없는 조합)
  handleGenerate: (historyLottoNumbers = []) =>
    set(() => {
      let numbersSet = new Set();
      let newNumbers;

      // 히스토리에 없는 번호 조합이 나올 때까지 반복
      do {
        numbersSet = new Set();
        while (numbersSet.size < 6) {
          const randomNumber = Math.floor(Math.random() * 45) + 1;
          numbersSet.add(randomNumber);
        }
        newNumbers = [...numbersSet].sort((a, b) => a - b);
      } while (
        historyLottoNumbers.some(
          // (nums) => JSON.stringify(nums) === JSON.stringify(newNumbers)
           (nums) => nums.length === newNumbers.length && nums.every((n, i) => n === newNumbers[i])
        )
      );

      return {
        lottoNumbers: newNumbers,
      };
    }),

  // 로또 번호 + 보너스 번호 생성
  generateLotto: () =>
    set(() => {
      // 1. 로또 번호 생성 (1~45 중 6개, 중복 없이)
      const numbers = [];
      while (numbers.length < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        if (!numbers.includes(randomNumber)) {
          numbers.push(randomNumber);
        }
      }
      numbers.sort((a, b) => a - b);

      // 2. 보너스 번호 생성 (1~45 중 로또 번호에 없는 숫자)
      let bonus = Math.floor(Math.random() * 45) + 1;
      while (numbers.includes(bonus)) {
        bonus = Math.floor(Math.random() * 45) + 1;
      }

      // 3. 상태 반환
      return {
        lottoNumbers: numbers,
        bonusNumber: bonus,
      };
    }),

  // 히스토리에 로또 번호 추가
  setHistoryLottoNumbers: (newHistory) =>
    set({
      historyLottoNumbers: newHistory,
    }),

  // 다크모드 토글
  toggleDarkMode: () =>
    set((state) => {
      const newDarkMode = !state.isDarkMode;
      localStorage.setItem('isDarkMode', newDarkMode);
      return { isDarkMode: newDarkMode };
    }),

  // 상태 초기화
  resetLotto: () =>
    set({
      lottoNumbers: [],
      bonusNumber: 0,
      historyLottoNumbers: [],
    }),
}));

export default useLottoStore;
