import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  STORES: '@comprafacil:stores',
  LISTS: '@comprafacil:lists',
  PRODUCTS: '@comprafacil:products',
};

const AppContext = createContext(null);

const initialState = {
  stores: [],
  lists: [],
  products: [],
  loading: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload, loading: false };

    // ─── Stores ───────────────────────────────────────────────────────────────
    case 'ADD_STORE':
      return { ...state, stores: [...state.stores, action.payload] };
    case 'UPDATE_STORE':
      return { ...state, stores: state.stores.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_STORE':
      return { ...state, stores: state.stores.filter(s => s.id !== action.payload) };
    case 'CLEAN_STORE_PRICES':
      return {
        ...state,
        lists: state.lists.map(l => ({
          ...l,
          items: l.items.map(i => ({
            ...i,
            prices: i.prices.filter(p => p.storeId !== action.payload),
          })),
        })),
      };

    // ─── Lists ────────────────────────────────────────────────────────────────
    case 'ADD_LIST':
      return { ...state, lists: [...state.lists, action.payload] };
    case 'UPDATE_LIST_NAME':
      return {
        ...state,
        lists: state.lists.map(l =>
          l.id === action.payload.id ? { ...l, name: action.payload.name } : l
        ),
      };
    case 'DELETE_LIST':
      return { ...state, lists: state.lists.filter(l => l.id !== action.payload) };

    // ─── List Items ───────────────────────────────────────────────────────────
    case 'ADD_ITEM':
      return {
        ...state,
        lists: state.lists.map(l =>
          l.id === action.payload.listId
            ? { ...l, items: [...l.items, action.payload.item] }
            : l
        ),
      };
    case 'DELETE_ITEM':
      return {
        ...state,
        lists: state.lists.map(l =>
          l.id === action.payload.listId
            ? { ...l, items: l.items.filter(i => i.id !== action.payload.itemId) }
            : l
        ),
      };
    case 'TOGGLE_ITEM':
      return {
        ...state,
        lists: state.lists.map(l =>
          l.id === action.payload.listId
            ? {
                ...l,
                items: l.items.map(i =>
                  i.id === action.payload.itemId ? { ...i, checked: !i.checked } : i
                ),
              }
            : l
        ),
      };
    case 'SET_ITEM_PRICE': {
      const { listId, itemId, storeId, storeName, price } = action.payload;
      return {
        ...state,
        lists: state.lists.map(l => {
          if (l.id !== listId) return l;
          return {
            ...l,
            items: l.items.map(item => {
              if (item.id !== itemId) return item;
              let prices;
              if (price === null) {
                prices = item.prices.filter(p => p.storeId !== storeId);
              } else {
                const idx = item.prices.findIndex(p => p.storeId === storeId);
                prices = idx >= 0
                  ? item.prices.map(p => p.storeId === storeId ? { ...p, price, storeName } : p)
                  : [...item.prices, { storeId, storeName, price }];
              }
              return { ...item, prices };
            }),
          };
        }),
      };
    }

    // ─── Products Catalog ─────────────────────────────────────────────────────
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'ADD_PRODUCTS_BATCH':
      return { ...state, products: [...state.products, ...action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p => p.id === action.payload.id ? action.payload : p),
      };
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter(p => p.id !== action.payload) };
    case 'CLEAR_PRODUCTS':
      return { ...state, products: [] };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ─── Hydrate from storage ──────────────────────────────────────────────────
  useEffect(() => {
    async function hydrate() {
      try {
        const [storesRaw, listsRaw, productsRaw] = await Promise.all([
          AsyncStorage.getItem(KEYS.STORES),
          AsyncStorage.getItem(KEYS.LISTS),
          AsyncStorage.getItem(KEYS.PRODUCTS),
        ]);
        dispatch({
          type: 'HYDRATE',
          payload: {
            stores: storesRaw ? JSON.parse(storesRaw) : [],
            lists: listsRaw ? JSON.parse(listsRaw) : [],
            products: productsRaw ? JSON.parse(productsRaw) : [],
          },
        });
      } catch {
        dispatch({ type: 'HYDRATE', payload: { stores: [], lists: [], products: [] } });
      }
    }
    hydrate();
  }, []);

  // ─── Persist on change ────────────────────────────────────────────────────
  useEffect(() => {
    if (!state.loading) AsyncStorage.setItem(KEYS.STORES, JSON.stringify(state.stores));
  }, [state.stores, state.loading]);

  useEffect(() => {
    if (!state.loading) AsyncStorage.setItem(KEYS.LISTS, JSON.stringify(state.lists));
  }, [state.lists, state.loading]);

  useEffect(() => {
    if (!state.loading) AsyncStorage.setItem(KEYS.PRODUCTS, JSON.stringify(state.products));
  }, [state.products, state.loading]);

  // ─── Store actions ────────────────────────────────────────────────────────
  const addStore = useCallback((name, address = '') => {
    const store = { id: `store_${Date.now()}`, name: name.trim(), address: address.trim(), createdAt: Date.now() };
    dispatch({ type: 'ADD_STORE', payload: store });
    return store;
  }, []);

  const updateStore = useCallback((store) => dispatch({ type: 'UPDATE_STORE', payload: store }), []);

  const deleteStore = useCallback((storeId) => {
    dispatch({ type: 'DELETE_STORE', payload: storeId });
    dispatch({ type: 'CLEAN_STORE_PRICES', payload: storeId });
  }, []);

  // ─── List actions ──────────────────────────────────────────────────────────
  const addList = useCallback((name) => {
    const list = { id: `list_${Date.now()}`, name: name.trim(), items: [], createdAt: Date.now() };
    dispatch({ type: 'ADD_LIST', payload: list });
    return list;
  }, []);

  const renameList = useCallback((listId, name) => {
    dispatch({ type: 'UPDATE_LIST_NAME', payload: { id: listId, name: name.trim() } });
  }, []);

  const deleteList = useCallback((listId) => dispatch({ type: 'DELETE_LIST', payload: listId }), []);

  // ─── Item actions ──────────────────────────────────────────────────────────
  const addItem = useCallback((listId, name, quantity = 1, unit = 'un') => {
    const item = {
      id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      quantity: Number(quantity) || 1,
      unit: unit || 'un',
      checked: false,
      prices: [],
    };
    dispatch({ type: 'ADD_ITEM', payload: { listId, item } });
    return item;
  }, []);

  const deleteItem = useCallback((listId, itemId) => {
    dispatch({ type: 'DELETE_ITEM', payload: { listId, itemId } });
  }, []);

  const toggleItem = useCallback((listId, itemId) => {
    dispatch({ type: 'TOGGLE_ITEM', payload: { listId, itemId } });
  }, []);

  const setItemPrice = useCallback((listId, itemId, storeId, storeName, price) => {
    dispatch({ type: 'SET_ITEM_PRICE', payload: { listId, itemId, storeId, storeName, price } });
  }, []);

  // ─── Product catalog actions ───────────────────────────────────────────────
  const addProduct = useCallback((product) => {
    const p = {
      id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: product.name?.trim() || '',
      category: product.category?.trim() || '',
      brand: product.brand?.trim() || '',
      unit: product.unit || 'un',
      barcode: product.barcode?.trim() || '',
      description: product.description?.trim() || '',
      createdAt: Date.now(),
    };
    dispatch({ type: 'ADD_PRODUCT', payload: p });
    return p;
  }, []);

  const importProducts = useCallback((products) => {
    dispatch({ type: 'ADD_PRODUCTS_BATCH', payload: products });
    return products.length;
  }, []);

  const updateProduct = useCallback((product) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: product });
  }, []);

  const deleteProduct = useCallback((productId) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: productId });
  }, []);

  const clearProducts = useCallback(() => {
    dispatch({ type: 'CLEAR_PRODUCTS' });
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        addStore, updateStore, deleteStore,
        addList, renameList, deleteList,
        addItem, deleteItem, toggleItem, setItemPrice,
        addProduct, importProducts, updateProduct, deleteProduct, clearProducts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
