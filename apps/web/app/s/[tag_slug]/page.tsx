import { Header } from "@/components/Header"
import { Database } from "@/types/supabase"
import { getComponents } from "@/lib/queries"
import { supabaseWithAdminAccess } from "@/lib/supabase"
import { SupabaseClient } from "@supabase/supabase-js"
import { notFound } from "next/navigation"
import { TagPageContent } from "./page.client"
import { Metadata } from "next"

interface TagPageProps {
  params: {
    tag_slug: string
  }
}

const getTagInfo = async (
  supabase: SupabaseClient<Database>,
  tagSlug: string,
) => {
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("slug", tagSlug)
    .single()

  if (error) {
    console.error("Error fetching tag info:", error)
    throw error
  }

  return data
}

export default async function TagPage({ params }: TagPageProps) {
  const tagSlug = params.tag_slug
  const [tagInfo, components] = await Promise.all([
    getTagInfo(supabaseWithAdminAccess, tagSlug),
    getComponents(supabaseWithAdminAccess, tagSlug),
  ])

  if (!tagInfo) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4">
      {tagInfo && <Header tagName={tagInfo?.name} page="components" />}
      <div className="mt-20">
        <TagPageContent components={components} />
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tagInfo = await getTagInfo(supabaseWithAdminAccess, params.tag_slug)
  
  if (!tagInfo) {
    return {
      title: "Tag Not Found | 21st.dev",
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${tagInfo.name} Components - The NPM for Design Engineers`,
    description: `Ready-to-use ${tagInfo.name.toLowerCase()} React components. Built by design engineers, for design engineers.`,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/s/${params.tag_slug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: `${tagInfo.name} React components`
    }
  }

  return {
    title: `${tagInfo.name} Components | The NPM for Design Engineers | 21st.dev`,
    description: `Discover and share ${tagInfo.name.toLowerCase()} components. Ready-to-use React components with Tailwind CSS and shadcn/ui. Built by design engineers, for design engineers.`,
    openGraph: {
      title: `${tagInfo.name} Components - The NPM for Design Engineers`,
      description: `Ready-to-use ${tagInfo.name.toLowerCase()} components for React and Tailwind CSS. Share your own components with the community.`,
    },
    keywords: [
      `${tagInfo.name.toLowerCase()} components`, 
      'react components', 
      'design engineers',
      'component library',
      'tailwind components', 
      'ui components', 
      `${tagInfo.name.toLowerCase()} shadcn/ui`
    ],
    other: {
      "script:ld+json": JSON.stringify(jsonLd)
    }
  }
}
