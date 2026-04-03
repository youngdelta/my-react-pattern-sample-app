import LottoGenerator from './LottoGenerator'
import LottoHistory from './LottoHistory'
import useLottoStore from '@/store/lottoStore'

export default function LottoApp() {
  const { historyLottoNumbers } = useLottoStore();

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>🎰 로또 번호 생성기</h1>
      </div>

      <div className="content-wrapper">
        <div className="generator-card">
          <LottoGenerator />
        </div>

        <div className="history-card">
          <LottoHistory historyLottoNumbers={historyLottoNumbers} />
        </div>
      </div>
    </div>
  );
}
