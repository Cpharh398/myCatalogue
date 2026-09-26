import type { Route } from "./+types/home";
import { ArrowRight, Check, LayoutTemplate, MousePointer2, PackageOpen, Sparkles, Store } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "myCatalogue · Your storefront starts here" },
    { name: "description", content: "Design a beautiful online shop or service website with a simple drag-and-drop builder." },
  ];
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f6f0] text-[#263329]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <a href="/" className="flex items-center gap-3 font-semibold tracking-tight"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#315b45] text-white"><Store size={19}/></span><span className="text-xl">myCatalogue</span></a>
        <div className="hidden items-center gap-8 text-sm text-[#677368] md:flex"><a href="#how-it-works" className="hover:text-[#263329]">How it works</a><a href="#features" className="hover:text-[#263329]">Features</a></div>
        <a href="/myworkspace" className="inline-flex items-center gap-2 rounded-full bg-[#315b45] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#254735]">Open my builder <ArrowRight size={16}/></a>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-10 md:grid-cols-[1.03fr_.97fr] md:items-center md:px-10 md:pb-28 md:pt-16">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d9dfd3] bg-[#eef2e9] px-4 py-2 text-sm text-[#47654e]"><Sparkles size={15}/>Your small business, online</div>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.04] tracking-[-.045em] md:text-7xl">A beautiful shop, made by you.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#6a7469]">myCatalogue is a simple website builder for people selling products and services. Choose a starting design, arrange your page, add your catalogue, and make a storefront that feels like yours.</p>
          <div className="mt-8 flex flex-wrap items-center gap-4"><a href="/myworkspace" className="inline-flex items-center gap-2 rounded-full bg-[#d87548] px-6 py-4 font-medium text-white shadow-sm transition hover:bg-[#bd5e35]">Get started <ArrowRight size={17}/></a><a href="#how-it-works" className="rounded-full px-5 py-4 font-medium text-[#47654e] hover:bg-[#ece9df]">See how it works</a></div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#697367]"><span><Check size={15} className="mr-1 inline text-[#56805c]"/>No code needed</span><span><Check size={15} className="mr-1 inline text-[#56805c]"/>Drag and drop editing</span><span><Check size={15} className="mr-1 inline text-[#56805c]"/>Made for small business</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -left-7 top-10 h-32 w-32 rounded-full bg-[#e8bf8d]"/><div className="absolute -right-4 bottom-5 h-28 w-28 rounded-full bg-[#b9c9a8]"/>
          <div className="relative rounded-[2rem] border border-[#dfdbd1] bg-white p-3 shadow-[0_28px_80px_rgba(47,61,48,.13)]">
            <div className="overflow-hidden rounded-[1.5rem] bg-[#faf7ef]">
              <div className="flex items-center justify-between border-b border-[#e8e3d7] bg-white px-6 py-4"><div className="font-semibold">Field & Form</div><div className="flex gap-5 text-xs text-[#6b746b]"><span>Shop</span><span>Our story</span><span>Contact</span></div><span className="rounded-full bg-[#315b45] px-3 py-2 text-xs text-white">Cart · 0</span></div>
              <div className="grid min-h-[330px] grid-cols-2 items-center gap-3 p-7 md:p-10"><div className="relative z-10"><span className="text-xs uppercase tracking-[.2em] text-[#78826f]">Made for everyday</span><h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">Good things, grown close.</h2><p className="mt-4 text-sm leading-6 text-[#758071]">Thoughtful home and garden goods, made by independent makers.</p><button className="mt-6 rounded-full bg-[#315b45] px-5 py-3 text-sm text-white">Explore the collection</button></div><div className="relative flex h-64 items-center justify-center rounded-[48%_48%_18px_18px] bg-[#d8dfcc]"><div className="absolute bottom-7 h-32 w-32 rounded-full bg-[#c18154]"/><div className="absolute bottom-7 h-24 w-24 rounded-full bg-[#e2b386]"/><div className="absolute bottom-0 h-10 w-full rounded-b-2xl bg-[#8a674b]"/></div></div>
              <div className="grid grid-cols-3 gap-3 bg-white p-5"><div className="h-16 rounded-xl bg-[#e8ddc9]"/><div className="h-16 rounded-xl bg-[#dce3d3]"/><div className="h-16 rounded-xl bg-[#e8d9d0]"/></div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-5 rounded-2xl border border-[#e6e1d7] bg-white px-4 py-3 shadow-lg"><div className="flex items-center gap-2 text-sm font-medium"><MousePointer2 size={16} className="text-[#d87548]"/>Move anything around</div></div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-[#e7e2d8] bg-[#eeece3] px-6 py-16 md:px-10 md:py-20"><div className="mx-auto max-w-7xl"><p className="text-sm font-medium uppercase tracking-[.18em] text-[#71816c]">How it works</p><h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">From idea to online shop in a few simple steps.</h2><div className="mt-10 grid gap-5 md:grid-cols-3">{[{n:"01",title:"Choose a look",copy:"Start with a shop or services template, or begin with a blank canvas."},{n:"02",title:"Make it yours",copy:"Drag in headings, images, buttons, and sections. Add your products and services."},{n:"03",title:"Share your site",copy:"Preview your pages on desktop and mobile, connect navigation, then prepare to publish."}].map(item=><article key={item.n} className="rounded-2xl border border-[#e0ddd3] bg-[#faf9f5] p-6"><span className="text-sm font-semibold text-[#d87548]">{item.n}</span><h3 className="mt-5 text-xl font-semibold">{item.title}</h3><p className="mt-3 leading-7 text-[#70796d]">{item.copy}</p></article>)}</div></div></section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20"><div className="grid gap-10 md:grid-cols-[.8fr_1.2fr]"><div><p className="text-sm font-medium uppercase tracking-[.18em] text-[#71816c]">The essentials</p><h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Everything to shape your storefront.</h2></div><div className="grid gap-6 sm:grid-cols-2">{[{icon:<MousePointer2/>,title:"Visual editor",copy:"Place, resize, and style elements on a drag-and-drop canvas."},{icon:<PackageOpen/>,title:"Product & service catalogue",copy:"Keep your offerings together and add them to the pages you design."},{icon:<LayoutTemplate/>,title:"Pages and sections",copy:"Build multi-page sites with navigation between pages and sections."},{icon:<Store/>,title:"Reusable designs",copy:"Save your own components and place them wherever you need."}].map(item=><article key={item.title} className="border-t border-[#ddd9ce] pt-5"><div className="text-[#497150]">{item.icon}</div><h3 className="mt-4 font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[#70796d]">{item.copy}</p></article>)}</div></div></section>
      <footer className="bg-[#315b45] px-6 py-12 text-white md:px-10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center"><div><div className="text-xl font-semibold">Ready to put your idea out there?</div><p className="mt-2 text-sm text-white/75">Build a welcoming home for what you make.</p></div><a href="/myworkspace" className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f2c08f] px-6 py-3 font-medium text-[#29392b]">Open myCatalogue <ArrowRight size={16}/></a></div></footer>
    </main>
  );
}
