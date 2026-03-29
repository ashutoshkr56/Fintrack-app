export const CATS = {
  income:  [{name:'Salary',icon:'💼'},{name:'Freelance',icon:'💻'},{name:'Investment',icon:'📈'},{name:'Gift',icon:'🎁'},{name:'Other Income',icon:'💰'}],
  expense: [{name:'Food',icon:'🍔'},{name:'Transport',icon:'🚌'},{name:'Utilities',icon:'⚡'},{name:'Shopping',icon:'🛍️'},{name:'Health',icon:'🏥'},{name:'Entertainment',icon:'🎬'},{name:'Education',icon:'📚'},{name:'Rent',icon:'🏠'},{name:'Other',icon:'📦'}]
};
export const CAT_COLORS = ['#c8f060','#60c8f0','#f0c060','#f06090','#b060f0','#60f0c8','#f09060','#90c8f0','#f0b0d0'];

export function fmt(n) {
  return '₹' + Math.abs(n).toLocaleString('en-IN', {minimumFractionDigits:0,maximumFractionDigits:0});
}

export function getCatIcon(name) {
  const all = [...CATS.income,...CATS.expense];
  return (all.find(c=>c.name===name)||{icon:'💳'}).icon;
}
