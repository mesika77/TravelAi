import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#faf7f1',
          position: 'relative',
          color: '#1a1814',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 10,
            borderRadius: 42,
            border: '2px solid #d9d2bf',
          }}
        />
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 999,
            background: '#1a1814',
            color: '#faf7f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            fontStyle: 'italic',
            marginRight: 10,
          }}
        >
          T
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 5 }}>
          <div style={{ fontSize: 35, lineHeight: 1 }}>Travel</div>
          <div style={{ fontSize: 28, lineHeight: 1, color: '#d8612e', fontStyle: 'italic' }}>AI</div>
        </div>
      </div>
    ),
    size
  )
}
