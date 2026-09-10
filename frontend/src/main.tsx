import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import 'antd/dist/reset.css'
import './styles.css'
import { App } from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider theme={{ token: { colorPrimary: '#44546a', borderRadius: 6, fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' } }}>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)
