import test from 'node:test';
import assert from 'node:assert/strict';
import { availableFeaturedProducts } from '../../src/lib/shopify/featured-products.ts';

const candidates = ['riyadh', 'big-sur', 'tobago', 'serengeti'].map(handle => ({title:handle,slug:{current:handle},price:33}));
test('replaces sold-out CMS features with available candidates and live starting prices', async () => {
  const result = await availableFeaturedProducts(candidates, async handles => {
    assert.deepEqual(handles, ['riyadh','big-sur','tobago','serengeti']);
    return handles.map(handle => ({handle, availableForSale:handle !== 'riyadh', price:handle==='serengeti'?28:23}));
  });
  assert.deepEqual(result.map(p=>p.title), ['big-sur','tobago','serengeti']);
  assert.deepEqual(result.map(p=>p.price), [23,23,28]);
});
test('does not promote unverified inventory when Shopify is unavailable', async () => {
  assert.deepEqual(await availableFeaturedProducts(candidates, async()=>{throw new Error('offline')}), []);
});
test('ignores missing, duplicate and unavailable handles', async () => {
  const result=await availableFeaturedProducts([...candidates,candidates[1],{title:'missing'}], async()=>[{handle:'big-sur',availableForSale:true,price:23}]);
  assert.deepEqual(result.map(p=>p.title),['big-sur']);
});
