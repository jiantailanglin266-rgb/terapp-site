/* ============================================================
   TERAPP — 商品データ（表示と分離 / 将来的なEC・CMS連携を想定）
   status: 'available' | 'coming-soon' | 'sold-out' | 'discontinued'
   category: ['beauty' | 'conditioning' | 'sports']
   価格・税区分・送料など未確定情報は推測しない。
   checkoutUrl 未設定時は問い合わせ導線へフォールバック。
   ============================================================ */
window.TERAPP_PRODUCTS = [
  {
    id:'lift-up-patch',
    slug:'product-lift-up-patch.html',
    name:'TERAPP Lift Up Patch',
    japaneseName:'テラップ リフトアップパッチ',
    category:['beauty'],
    catLabel:'Beauty',
    shortDescription:'フェイスライン、頬、首元、デコルテなど、印象が気になる部分に使用する美容ケア用パッチ。',
    priceLabel:'1セット 2,200円 / 3セット 5,500円',
    price:2200,
    currency:'JPY',
    status:'available',
    image:'images/products/lift-up-patch.webp',
    checkoutUrl:'',   // TODO: 決済URL確定後に設定（未設定時は詳細ページの問い合わせ導線へ）
    featured:true
  },
  {
    id:'conditioning-tape',
    slug:'product-conditioning-tape.html',
    name:'TERAPP Conditioning Tape',
    japaneseName:'テラヘルツ コンディショニングテープ',
    category:['conditioning','sports'],
    catLabel:'Conditioning / Sports',
    shortDescription:'日常生活からスポーツシーンまで、気になる部分へ貼って使用するコンディショニングテープ。',
    priceLabel:'価格・仕様は準備中です',
    price:null,
    currency:'JPY',
    status:'coming-soon',
    image:'images/products/conditioning-tape.webp',
    checkoutUrl:'',
    featured:false
  }
];
