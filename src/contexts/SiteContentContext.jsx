import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { defaultSiteContent } from '../data/siteContent';

const SiteContentContext = createContext(null);

export function SiteContentProvider({ children }) {
  const [siteContent, setSiteContent] = useState(defaultSiteContent);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSiteContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('id', 'active')
        .single();
      
      if (error) {
        console.error("Error fetching site content from Supabase:", error);
      } else if (data) {
        setPreviewMode(data.preview_mode);
        // If preview mode is ON, show draft_content. Else, show published_content.
        const contentToUse = data.preview_mode ? data.draft_content : data.published_content;
        
        // Deep-merge loaded content with defaultSiteContent to safeguard against missing keys
        setSiteContent(mergeWithDefaults(contentToUse));
      }
    } catch (err) {
      console.error("Failed to fetch site content from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  const mergeWithDefaults = (parsed) => {
    if (!parsed || typeof parsed !== "object") return defaultSiteContent;
    return {
      ...defaultSiteContent,
      ...parsed,
      heroDates: { ...defaultSiteContent.heroDates, ...(parsed.heroDates || {}) },
      homeStats: { ...defaultSiteContent.homeStats, ...(parsed.homeStats || {}) },
      gallery: { ...defaultSiteContent.gallery, ...(parsed.gallery || {}) },
      registration: { ...defaultSiteContent.registration, ...(parsed.registration || {}) },
      contact: {
        ...defaultSiteContent.contact,
        ...(parsed.contact || {}),
        general: {
          ...defaultSiteContent.contact.general,
          ...((parsed.contact && parsed.contact.general) || {}),
        },
      },
    };
  };

  useEffect(() => {
    fetchSiteContent();
  }, []);

  return (
    <SiteContentContext.Provider value={{ siteContent, setSiteContent, previewMode, setPreviewMode, loading, refresh: fetchSiteContent }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export const useSiteContent = () => {
  const context = useContext(SiteContentContext);
  if (!context) {
    // If used outside provider, return default content as a safe fallback
    return defaultSiteContent;
  }
  return context.siteContent;
};

export const useSiteContentActions = () => {
  const context = useContext(SiteContentContext);
  if (!context) {
    return { loading: false, previewMode: false, refresh: () => Promise.resolve() };
  }
  return {
    loading: context.loading,
    previewMode: context.previewMode,
    refresh: context.refresh
  };
};
