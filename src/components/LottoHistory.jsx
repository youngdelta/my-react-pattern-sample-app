import { useMemo } from 'react';
import useLottoStore from '@/store/lottoStore'

function LottoHistory() {
    const { historyLottoNumbers, resetLotto } = useLottoStore();

    const getNumberColor = (index) => {
        return `color-${index + 1}`;
    };

    // 역순 배열을 메모이제이션하여 불필요한 복사 방지
    const reversedHistory = useMemo(() => {
        return [...historyLottoNumbers].reverse();
    }, [historyLottoNumbers]);

    return (
        <div>
            <h2>생성 기록</h2>
            
            {historyLottoNumbers.length === 0 ? (
                <div className="empty-state">
                    <p>📋 아직 생성된 번호가 없습니다</p>
                </div>
            ) : (
                <ul className="history-list">
                    {reversedHistory.map((numbers, index) => (
                        <li key={`${historyLottoNumbers.length - index}-${numbers.join(',')}`} className="history-item">
                            <span style={{ fontWeight: '600', color: 'var(--primary)', minWidth: '40px' }}>
                                #{historyLottoNumbers.length - index}
                            </span>
                            <div className="history-numbers">
                                {numbers.map((number, numIndex) => (
                                    <div key={numIndex} className={`history-number ${getNumberColor(numIndex)}`}>
                                        {number}
                                    </div>
                                ))}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            
            {historyLottoNumbers.length > 0 && (
                <button 
                    onClick={resetLotto}
                    style={{
                        width: '100%',
                        marginTop: '1.5rem',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    }}
                >
                    🗑️ 모두 삭제
                </button>
            )}
        </div>
    )
}

export default LottoHistory