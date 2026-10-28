"use client";

import Link from "next/link";

const sizes = ["0-3 Months", "3-6 Months", "6-9 Months", "9-12 Months", "12-18 Months"];

export function CollectionControls({ basePath, values }: { basePath: string; values: Record<string, string | undefined> }) {
  return <>
    <form className="collection-filter-form" method="get">
      <div className="collection-filter-head"><h2>Filter &amp; sort</h2><Link href={basePath}>Clear all</Link></div>
      <label>Age / size<select className="admin-select" name="size" defaultValue={values.size ?? ""}><option value="">All sizes</option>{sizes.map((size) => <option key={size}>{size}</option>)}</select></label>
      <label>For<select className="admin-select" name="gender" defaultValue={values.gender ?? ""}><option value="">All</option><option>Boys</option><option>Girls</option><option>Unisex</option></select></label>
      <label>Season<select className="admin-select" name="season" defaultValue={values.season ?? ""}><option value="">All seasons</option><option>Winter</option><option>Summer</option><option>All Seasons</option></select></label>
      <div className="collection-price-fields"><label>Min price<input className="admin-input" type="number" min="0" name="minPrice" placeholder="Rs.0" defaultValue={values.minPrice ?? ""} /></label><label>Max price<input className="admin-input" type="number" min="0" name="maxPrice" placeholder="No limit" defaultValue={values.maxPrice ?? ""} /></label></div>
      <label>Availability<select className="admin-select" name="availability" defaultValue={values.availability ?? ""}><option value="">All products</option><option value="in-stock">In stock</option><option value="sold-out">Sold out</option></select></label>
      <label className="collection-sort-label">Sort by<select className="admin-select" name="sort" defaultValue={values.sort ?? "featured"}><option value="featured">Featured</option><option value="newest">Newest</option><option value="price-ascending">Price: low to high</option><option value="price-descending">Price: high to low</option><option value="title-ascending">Alphabetically</option></select></label>
      <label className="collection-view-label">View<select className="admin-select" name="view" defaultValue={values.view ?? "grid"}><option value="grid">Grid</option><option value="list">List</option></select></label>
      <button className="button-primary collection-apply" type="submit">Apply filters</button>
    </form>
    <details className="collection-mobile-filters"><summary>Filters &amp; sort</summary><form className="collection-filter-form" method="get">
      <label>Age / size<select className="admin-select" name="size" defaultValue={values.size ?? ""}><option value="">All sizes</option>{sizes.map((size) => <option key={size}>{size}</option>)}</select></label>
      <label>For<select className="admin-select" name="gender" defaultValue={values.gender ?? ""}><option value="">All</option><option>Boys</option><option>Girls</option><option>Unisex</option></select></label>
      <label>Season<select className="admin-select" name="season" defaultValue={values.season ?? ""}><option value="">All seasons</option><option>Winter</option><option>Summer</option><option>All Seasons</option></select></label>
      <div className="collection-price-fields"><label>Min price<input className="admin-input" type="number" min="0" name="minPrice" defaultValue={values.minPrice ?? ""} /></label><label>Max price<input className="admin-input" type="number" min="0" name="maxPrice" defaultValue={values.maxPrice ?? ""} /></label></div>
      <label>Availability<select className="admin-select" name="availability" defaultValue={values.availability ?? ""}><option value="">All products</option><option value="in-stock">In stock</option><option value="sold-out">Sold out</option></select></label>
      <label>Sort by<select className="admin-select" name="sort" defaultValue={values.sort ?? "featured"}><option value="featured">Featured</option><option value="newest">Newest</option><option value="price-ascending">Price: low to high</option><option value="price-descending">Price: high to low</option><option value="title-ascending">Alphabetically</option></select></label>
      <label>View<select className="admin-select" name="view" defaultValue={values.view ?? "grid"}><option value="grid">Grid</option><option value="list">List</option></select></label>
      <button className="button-primary collection-apply" type="submit">Apply filters</button><Link className="text-link" href={basePath}>Clear all</Link>
    </form></details>
  </>;
}
