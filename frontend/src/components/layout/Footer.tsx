export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="footer-logo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="footer-brand-text">臺電時間電價比較</span>
            </div>

            <p className="footer-description">
              幫助您找出最省錢的電價方案，根據臺灣電力公司最新費率計算。
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-section">
              <h4 className="footer-heading">功能</h4>
              <ul className="footer-list">
                <li><a href="#features">20+ 方案比較</a></li>
                <li><a href="#features">AI 智慧識別</a></li>
                <li><a href="#features">資料安全</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">關於</h4>
              <ul className="footer-list">
                <li><a href="https://github.com/taipower-tou-web">GitHub</a></li>
                <li><a href="https://taipower.com.tw">臺灣電力公司</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2025 臺電時間電價比較網站 | 資料來源：臺灣電力公司
          </p>
          <p className="footer-note">
            純前端應用，資料不上傳伺服器
          </p>
        </div>
      </div>
    </footer>
  )
}
