import { ImageResponse } from 'next/og'

export const size = {
  width: 512,
  height: 512,
}

export const contentType = 'image/png'

export default function Icon() {
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
          color: '#1a1814',
          position: 'relative',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 26,
            borderRadius: 108,
            border: '8px solid #d9d2bf',
          }}
        />
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: 999,
            background: '#1a1814',
            color: '#faf7f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 98,
            fontStyle: 'italic',
            marginRight: 26,
          }}
        >
          T
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            marginTop: 16,
          }}
        >
          <div style={{ fontSize: 106, lineHeight: 1 }}>Travel</div>
          <div style={{ fontSize: 84, lineHeight: 1, color: '#d8612e', fontStyle: 'italic' }}>AI</div>
        </div>
      </div>
    ),
    size
  )
}
