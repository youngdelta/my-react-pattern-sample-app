import { useState, useEffect, useMemo, useCallback } from 'react';

const API_BASE = 'https://dummyjson.com';

export function useProducts() {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/products?limit=0`).then((r) => r.json()),
      fetch(`${API_BASE}/products/categories`).then((r) => r.json()),
    ])
      .then(([productsData, categoriesData]) => {
        setAllProducts(productsData.products);
        setCategories(categoriesData);
      })
      .finally(() => setLoading(false));
  }, []);

  const brands = useMemo(() => {
    return [...new Set(allProducts.map((p) => p.brand).filter(Boolean))].sort();
  }, [allProducts]);

  return { allProducts, categories, brands, loading };
}

export function useProductFilter(allProducts) {
  const [filters, setFilters] = useState({
    category: undefined,
    title: '',
    brand: undefined,
    sku: '',
    availability: undefined,
    createdRange: null,
    updatedRange: null,
  });

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      category: undefined,
      title: '',
      brand: undefined,
      sku: '',
      availability: undefined,
      createdRange: null,
      updatedRange: null,
    });
  }, []);

  const filteredProducts = useMemo(() => {
    const { category, title, brand, sku, availability, createdRange, updatedRange } = filters;
    return allProducts.filter((p) => {
      if (category && p.category !== category) return false;
      if (title && !p.title.toLowerCase().includes(title.toLowerCase())) return false;
      if (brand && p.brand !== brand) return false;
      if (sku && !(p.sku || '').toLowerCase().includes(sku.toLowerCase())) return false;
      if (availability && p.availabilityStatus !== availability) return false;
      if (createdRange) {
        const created = new Date(p.meta?.createdAt);
        if (created < createdRange[0].startOf('day') || created > createdRange[1].endOf('day')) return false;
      }
      if (updatedRange) {
        const updated = new Date(p.meta?.updatedAt);
        if (updated < updatedRange[0].startOf('day') || updated > updatedRange[1].endOf('day')) return false;
      }
      return true;
    });
  }, [allProducts, filters]);

  return { filters, updateFilter, resetFilters, filteredProducts };
}
