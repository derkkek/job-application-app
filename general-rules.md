Proje genel kuralları v2
page.tsx'lerin Server Component olması
Kural:
Tüm page.tsx dosyaları Server Component olarak tanımlanmalıdır (yani "use client" yazılmamalı).
Neden?
Uygulama:
Server Components daha az JS bundle üretir.
SSR (Server Side Rendering) ile SEO ve performans avantajı sağlar.
DB çağrıları yapan Server Actions ve hassas işlemler direkt sunucuda yapılabilir.
Data fetching işlemleri Server Component içinde yapılmalıdır. Eğer UI tarafında interaktif bir işlem gerekiyorsa bu logic
child bir Client Component olarak ayrılmalıdır.
Client Components’ın ihtiyaç duyduğu data, Server Component tarafından fetch edilmeli ve prop olarak Client
Component’a aktarılmalıdır.
Client Component’ın ihtiyacı olan data modeli, mümkün olduğunca models klasorü altındaki domain dosyalarında
( /models/student.ts , /models/payment.ts vb.) içinde tanımlanmış mevcut modellerden kullanılmalıdır.
// app/products/page.tsx
import { Suspense } from 'react';
import { getProductsByTenant } from '@/lib/actions';
import ProductsList from '@/components/organisms/ProductsList';
export default async function ProductsPage() {
// Server fetch — set cache policy as needed
const productsPromise = getProductsByTenant(); // start early, await at the boundary
return (
<section>
<h1 className="text-xl font-semibold">Products</h1>
<Suspense fallback={<div>Loading products…</div>}>
{/* Resolve the promise here; until then, render the fallback */}
<ProductsList products={await productsPromise} />
</Suspense>
</section>
);
}
// components/organisms/ProductsList.tsx
'use client';
import type { Brand } from '@/models/brand';
export default function ProductsList({ products }: { products: Brand[] }) {
// Client-only interactivity (filters, sort, local state) lives here
return (
<ul className="grid gap-3">
{products.map((p) => (
<li key={p.id} className="rounded border p-3">
<div className="font-medium">{p.name}</div>
</li>
))}
</ul>
Suspense kullanımı
Kural:
Suspense , render sırasında suspend edebilen subtree’leri (ör. data fetch eden Server/Client Components veya lazyloaded Client Components) hedefli olarak sarmalamak için kullanılmalıdır. Senkron subtree’leri alışkanlıkla sarmalamayın.
Neden?
Uygulama:
Notlar:
useMutation kullanımı
Kural:
Mutations, response success durumunu kontrol ederek throw ile hata fırlatmalı ve mutate fonksiyonu rename edilerek
kullanıma hazır hale getirilmelidir.
Neden?
Field Açıklamaları:
Template:
);
}
Progressive streaming: Page shell hemen gelir, yavaş parçalar hazır oldukça stream edilir.
Daha iyi UX: Her async kısım için fallback (skeleton/spinner) gösterilir.
Daha az waterfall: “Start early, await late” pattern'ı ile bağımsız istekler paralel çalışır.
Route-level pending için loading.tsx kullanın.
Component-level pending için:
<Suspense fallback={<Skeleton />}>
{/* This subtree may suspend during render */}
<SlowSection />
</Suspense>
Hem Server hem Client Components Suspense altında suspend edebilir (Server: await fetch , Client: React.lazy /
next/dynamic({ suspense: true }) ).
Sadece gerçekten suspend edebilen subtree’leri sarmalayın.
Parallel data fetching için istekleri erken başlatın, await işlemini Suspense boundary içinde yapın.
onSuccess / onError merkezi ve sade yönetilir.
isPending / error state’lerine doğrudan erişilir.
İşlem sırasında UI elements disabled edilebilir.
mutationFn : Asıl API call. Başarısızlıkta throw .
onSuccess : Başarı sonrası (örn. router.refresh() ).
onError : Hata toast vb.
isPending : Devam eden işlem.
Kullanım:
Not:
isPending ile işlem geri bildirimi ve buton disabled durumu UX için kritik.
useQuery kullanımı
Kural:
Data fetching için useQuery kullanılmalı ve queryKey anlamlı olmalı. enabled ve staleTime ihtiyaca göre ayarlanmalıdır.
Neden?
Field Açıklamaları:
Template:
const {
mutate: serverDeleteProfile,
isPending: isLoadingDeleteProfile,
error: isErrorDeleteProfile,
} = useMutation({
mutationFn: async (profileId: string) => {
const response = await deleteProfile(profileId);
if (!response.success) throw new Error(response.error || 'Failed to delete profile');
return response.data;
},
onSuccess: () => {
router.refresh();
toast.success('Member removed successfully!');
},
onError: (error) => {
const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
toast.error(errorMessage);
},
});
<button onClick={() => serverDeleteProfile(profileId)} disabled={isLoadingDeleteProfile}>
{isLoadingDeleteProfile ? 'Deleting…' : 'Delete'}
</button>
Automatic cache ve performans.
Duplicate sorguların önlenmesi.
Loading/error state management kolaylığı.
queryKey : Benzersiz cache key.
queryFn : Data source.
enabled : Çalıştırma koşulu (örn. !!param ).
staleTime : Fresh kabul süresi (ms).
meta : Özel error mesajları vb.
const {
data: catalogDetailsData,
isLoading: isLoadingCatalogDetails,
error: isErrorCatalogDetails,
isSuccess: isSuccessCatalogDetails,
} = useQuery({
Kullanım:
Not:
Form oluşturma ( zod + react-hook-form + useMutation )
Kural:
Validation için zod , form state için react-hook-form , submit için useMutation kullanın.
Neden?
Örnek:
queryKey: ['catalogDetails', catalogId],
queryFn: () => getCatalogDetailsByTenantId(catalogId),
enabled: !!catalogId,
staleTime: 5000,
meta: {
errorMessage: 'An error occurred while fetching catalog details',
},
});
if (isLoadingCatalogDetails) return <Skeleton />;
if (isErrorCatalogDetails) return <p>Something went wrong.</p>;
return <CatalogDetailCard data={catalogDetailsData} />;
Initial render için mümkün olduğunca Server-side fetching tercih edin; canlı/interactive senaryolar için useQuery .
Server’dan gelen data’yı client’ta yeniden fetch etmemek için ya prop olarak geçin ya da React Query ile hydrate edin.
Aynı zod schema’yı client ve server’da paylaşabilirsiniz.
react-hook-form minimal re-render ve güçlü validation.
useMutation ile loading/feedback kontrolü.
const schema = z.object({
name: z.string().min(1),
});
const form = useForm({
resolver: zodResolver(schema),
});
const {
mutate: serverCreateBrand,
isPending: isLoadingCreateBrand,
} = useMutation({
mutationFn: async (data) => {
const response = await createBrand(data);
if (!response.success) throw new Error(response.error || 'Creation failed');
return response.data;
},
onSuccess: () => {
toast.success('Brand created');
form.reset();
},
onError: (error) => {
toast.error(error.message);
},
Helper function’ların utils.ts ’te tanımlanması
Kural:
Tekrarlanan, bağımsız ve küçük helper functions utils.ts gibi ayrı dosyalarda tutulmalıdır.
Neden?
Örnek:
Modellerin ( interface / type ) models ’te tanımlanması
Kural:
API responses, form inputs ve shared data structures için interface / type tanımları merkezi tutulmalıdır.
Neden?
Atomic Design
});
<form onSubmit={form.handleSubmit((data) => serverCreateBrand(data))}>
<input { ... form.register('name')} />
{form.formState.errors.name && <p>{form.formState.errors.name.message}</p>}
<button type="submit" disabled={isLoadingCreateBrand}>
{isLoadingCreateBrand ? 'Creating…' : 'Create'}
</button>
</form>
Reusability ve readability artar.
Service veya component içindeki complexity azalır.
// utils.ts
export function capitalize(str: string) {
return str.charAt(0).toUpperCase() + str.slice(1);
}
TypeScript ile type safety.
Modellerin tek yerden yönetimi.
models/
 brand.ts
 catalog.ts
 index.ts
// /models/student.ts
export interface Student {
name: string;
id: string;
registerDate: Date;
}
Kural:
Components, Atomic Design prensiplerine göre atoms , molecules , organisms , pages klasörlerine yerleştirilmelidir.
Neden?
Tanımlar:
Örnek klasör yapısı:
Not: App Router ile route/feature-colocation (dosyaları ilgili route’a yakın tutmak) da güçlü bir yaklaşımdır; Atomic
isimlendirmeyi feature klasörleri içinde koruyabilirsiniz.
Modüler ve sürdürülebilir UI yapısı.
Hangi component’in nerede ve ne için kullanıldığı netleşir.
atoms: Button, Input, Label.
molecules: FormField, ModalHeader.
organisms: Modal, CardList.
pages: app/ altındaki page.tsx ve özel sayfalar.
components/
 atoms/
  Button.tsx
 molecules/
  FormField.tsx
 organisms/
  BrandModal.tsx
 pages/
  BrandPage.tsx