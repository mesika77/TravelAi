export default function DiscoverLoading() {
  return (
    <>
      <div className="trip-bar">
        <div className="wrap trip-bar-inner">
          <div className="shimmer discover-loading-line" />
          <div className="shimmer discover-loading-line discover-loading-line-mid" />
          <div className="shimmer discover-loading-line discover-loading-line-short" />
        </div>
      </div>

      <div className="wrap discover-header">
        <div>
          <div className="eyebrow">Discovery search</div>
          <h1 className="discover-title serif" style={{ maxWidth: 900 }}>
            Finding places that fit your trip.
          </h1>
          <p className="discover-desc mute">
            Checking weather, passport access, and realistic flight routes. This can take a few seconds.
          </p>
        </div>
      </div>

      <div className="discover-grid wrap">
        {[0, 1, 2].map((index) => (
          <section key={index} className="discover-card">
            <div className="discover-card-media shimmer" />
            <div className="discover-card-body">
              <div className="discover-card-head">
                <div style={{ width: '100%' }}>
                  <div className="shimmer discover-loading-line discover-loading-line-short" />
                  <div className="shimmer discover-loading-title" />
                </div>
                <div className="shimmer discover-loading-line discover-loading-line-mid" />
              </div>

              <div className="discover-metrics">
                {[0, 1, 2, 3, 4].map((metric) => (
                  <div
                    key={metric}
                    className={'discover-metric' + (metric === 4 ? ' discover-metric-wide' : '')}
                  >
                    <div style={{ width: '100%' }}>
                      <div className="shimmer discover-loading-line discover-loading-line-short" />
                      <div className="shimmer discover-loading-line" style={{ marginTop: 10 }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="discover-reasons">
                {[0, 1, 2, 3].map((reason) => (
                  <div key={reason} className="shimmer discover-loading-pill" />
                ))}
              </div>

              <div className="discover-actions">
                <div className="shimmer discover-loading-button" />
                <div className="shimmer discover-loading-line discover-loading-line-mid" />
              </div>
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
