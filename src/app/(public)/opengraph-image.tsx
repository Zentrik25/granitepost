import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'The Granite Post — Breaking Zimbabwe News'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* Amber left accent bar */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 10,
            height: 630,
            background: '#d97706',
          }}
        />

        {/* Site name */}
        <div
          style={{
            fontSize: 76,
            fontWeight: 'bold',
            color: '#ffffff',
            letterSpacing: '-2px',
            lineHeight: 1,
            marginBottom: 20,
          }}
        >
          The Granite Post
        </div>

        {/* Domain */}
        <div
          style={{
            fontSize: 26,
            color: '#d97706',
            letterSpacing: '6px',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          thegranite.co.zw
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 24,
            color: '#9ca3af',
          }}
        >
          Breaking Zimbabwe News &amp; In-Depth Coverage
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
