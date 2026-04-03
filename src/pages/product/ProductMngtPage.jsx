import { useState } from 'react';
import { ConfigProvider, theme } from 'antd';
import useLottoStore from '@/store/lottoStore';
import ProductModal from '@/components/ProductModal';
import { useProducts, useProductFilter } from './useProductData';
import ProductSearchFilter from './ProductSearchFilter';
import ProductResultTable from './ProductResultTable';
import './ProductMngtPage.css';

function ProductMngtPage() {
  const { isDarkMode } = useLottoStore();
  const { allProducts, categories, brands, loading } = useProducts();
  const { filters, updateFilter, resetFilters, filteredProducts } = useProductFilter(allProducts);
  const [selectedProductId, setSelectedProductId] = useState(null);

  return (
    <ConfigProvider
      theme={{ algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}
    >
      <div className="product-mngt-page">
        <h1 className="product-mngt-title">📋 상품관리</h1>

        <ProductSearchFilter
          filters={filters}
          categories={categories}
          brands={brands}
          onFilterChange={updateFilter}
          onReset={resetFilters}
          onSearch={() => {}}
        />

        <ProductResultTable
          products={filteredProducts}
          loading={loading}
          onTitleClick={setSelectedProductId}
        />

        {selectedProductId && (
          <ProductModal
            productId={selectedProductId}
            onClose={() => setSelectedProductId(null)}
          />
        )}
      </div>
    </ConfigProvider>
  );
}

export default ProductMngtPage;
