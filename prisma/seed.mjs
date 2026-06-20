import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// All field keys used by the guided measurement module.
const ALL = ['totalLength','shoulderWidth','bust','waist','hips','sleeveLength','armWidth','neck'];

const fabrics = [
  { slug: 'nida-premium', nameEn: 'Premium Nida', nameAr: 'نيدا ممتاز', priceAdd: 0,   swatch: '#2B2926', leadDays: 7,  colors: [['Black','أسود','#1d1b19'],['Charcoal','فحمي','#3a3733'],['Navy','كحلي','#1f2a3c']] },
  { slug: 'crepe-soft',   nameEn: 'Soft Crepe',   nameAr: 'كريب ناعم', priceAdd: 4000, swatch: '#6F6A62', leadDays: 10, colors: [['Stone','حجري','#9c9388'],['Mauve','موف','#8d7178'],['Sage','مريمي','#9AA792']] },
  { slug: 'linen-blend',  nameEn: 'Linen Blend',  nameAr: 'مزيج كتان', priceAdd: 6000, swatch: '#E9E1D4', leadDays: 14, colors: [['Sand','رملي','#E9E1D4'],['Ivory','عاجي','#F7F3EC'],['Dusty Rose','وردي','#B79189']] },
];

const styles = [
  { slug:'classic-closed', type:'CLOSED',     nameEn:'Classic Closed Abaya', nameAr:'عباية مغلقة كلاسيكية', basePrice:35000, image:'/images/style-closed.svg',     descEn:'A timeless closed-front silhouette with a clean, elegant drape.', descAr:'تصميم مغلق خالد بانسدال أنيق ونظيف.', fields: ALL },
  { slug:'open-front',     type:'OPEN_FRONT', nameEn:'Open-Front Abaya',     nameAr:'عباية مفتوحة من الأمام', basePrice:39000, image:'/images/style-open.svg',       descEn:'A versatile open-front layer, perfect over any outfit.', descAr:'طبقة مفتوحة من الأمام متعددة الاستخدامات.', fields: ALL },
  { slug:'butterfly',      type:'BUTTERFLY',  nameEn:'Butterfly Abaya',      nameAr:'عباية فراشة', basePrice:42000, image:'/images/style-butterfly.svg', descEn:'Dramatic flowing wings for a graceful, statement look.', descAr:'أجنحة منسدلة لإطلالة أنيقة ولافتة.', fields: ['totalLength','shoulderWidth','bust','sleeveLength','neck'] },
  { slug:'flared',         type:'FLARED',     nameEn:'Flared Abaya',         nameAr:'عباية كلوش', basePrice:40000, image:'/images/style-flared.svg',    descEn:'Fitted at the shoulder with a softly flared hem.', descAr:'ضيقة عند الكتف مع ذيل منسدل بنعومة.', fields: ALL },
];

async function main() {
  for (const f of fabrics) {
    const fabric = await prisma.fabric.upsert({
      where: { slug: f.slug },
      update: {},
      create: {
        slug: f.slug, nameEn: f.nameEn, nameAr: f.nameAr,
        priceAdd: f.priceAdd, swatch: f.swatch, leadDays: f.leadDays,
        colors: { create: f.colors.map(([nameEn,nameAr,hex]) => ({ nameEn, nameAr, hex })) },
      },
    });
    f.id = fabric.id;
  }

  for (const s of styles) {
    const style = await prisma.style.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        slug: s.slug, type: s.type, nameEn: s.nameEn, nameAr: s.nameAr,
        descEn: s.descEn, descAr: s.descAr, basePrice: s.basePrice,
        image: s.image, fields: s.fields,
      },
    });
    // link all fabrics to every style
    for (const f of fabrics) {
      await prisma.styleFabric.upsert({
        where: { styleId_fabricId: { styleId: style.id, fabricId: f.id } },
        update: {},
        create: { styleId: style.id, fabricId: f.id },
      });
    }
  }

  console.log('Seed complete:', styles.length, 'styles,', fabrics.length, 'fabrics.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
