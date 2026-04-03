import React, { useState, useEffect } from 'react';
import useLottoStore from '@/store/lottoStore';

function LottoGenerator() {
  const { lottoNumbers, handleGenerate, setHistoryLottoNumbers, historyLottoNumbers } = useLottoStore();
  const [justGenerated, setJustGenerated] = useState(false);

  const handleGenerateClick = () => {
    handleGenerate(historyLottoNumbers);
    setJustGenerated(true);
    setTimeout(() => setJustGenerated(false), 500);

    console.log(justGenerated);
    
  };

  // lottoNumbers가 변경될 때마다 자동으로 히스토리에 저장
  useEffect(() => {
    if (lottoNumbers.length === 6) {
      setHistoryLottoNumbers([...historyLottoNumbers, lottoNumbers]);
      // setHistoryLottoNumbers((prev) => [...prev, lottoNumbers]);
    }
  }, [lottoNumbers]);

  const getNumberColor = (index) => {
    return `color-${index + 1}`;
  };

  return (
    <div>
      <h2>로또 번호 생성</h2>
      
      <div className="lotto-numbers-display">
        {lottoNumbers.length > 0 ? (
          lottoNumbers.map((number, index) => (
            <div key={index} className={`lotto-number ${getNumberColor(index)}`}>
              {number}
            </div>
          ))
        ) : (
          <p style={{ color: 'white', fontSize: '1.1rem' }}>번호를 생성해주세요</p>
        )}
      </div>

      <div className="button-group">
        <button onClick={handleGenerateClick}>
          ✨ 번호 생성
        </button>
      </div>
    </div>
  );
}

export default LottoGenerator;
