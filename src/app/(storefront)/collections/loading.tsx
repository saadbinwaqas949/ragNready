export default function CollectionLoading() {
  return <main className="section collection-skeleton" aria-label="Loading products"><div className="skeleton-heading" /><div className="skeleton-grid">{Array.from({ length: 8 }, (_, index) => <div className="skeleton-card" key={index}><span /><i /><i /></div>)}</div></main>;
}
