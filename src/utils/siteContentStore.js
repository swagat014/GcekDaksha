import { supabase } from "../supabaseClient";
import { defaultSiteContent, SITE_CONTENT_STORAGE_KEY } from "../data/siteContent";

const isBrowser = typeof window !== "undefined";
const DRAFT_SITE_CONTENT_STORAGE_KEY = `${SITE_CONTENT_STORAGE_KEY}_draft`;
const PREVIEW_MODE_STORAGE_KEY = `${SITE_CONTENT_STORAGE_KEY}_preview_mode`;

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
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

// ================= SUPABASE ASYNC API =================

/**
 * Fetch the active site configuration row from Supabase
 */
export const fetchSiteContentFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from("site_content")
      .select("*")
      .eq("id", "active")
      .single();

    if (error) throw error;
    if (data) {
      // Sync localStorage cache
      if (isBrowser) {
        window.localStorage.setItem(SITE_CONTENT_STORAGE_KEY, JSON.stringify(data.published_content));
        window.localStorage.setItem(DRAFT_SITE_CONTENT_STORAGE_KEY, JSON.stringify(data.draft_content));
        window.localStorage.setItem(PREVIEW_MODE_STORAGE_KEY, data.preview_mode ? "true" : "false");
      }
      return data;
    }
  } catch (err) {
    console.error("Error in fetchSiteContentFromSupabase:", err);
  }
  return null;
};

/**
 * Save draft content to Supabase
 */
export const saveDraftSiteContent = async (content) => {
  if (isBrowser) {
    window.localStorage.setItem(DRAFT_SITE_CONTENT_STORAGE_KEY, JSON.stringify(content));
  }
  try {
    const { error } = await supabase
      .from("site_content")
      .update({
        draft_content: content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "active");

    if (error) throw error;
  } catch (err) {
    console.error("Error in saveDraftSiteContent to Supabase:", err);
  }
};

/**
 * Publish draft content to live published content in Supabase
 */
export const publishDraftSiteContent = async () => {
  let draft = loadDraftOrPublishedSiteContent();
  if (isBrowser) {
    window.localStorage.setItem(SITE_CONTENT_STORAGE_KEY, JSON.stringify(draft));
  }
  try {
    // Get the latest draft from Supabase first for consistency
    const { data } = await supabase
      .from("site_content")
      .select("draft_content")
      .eq("id", "active")
      .single();

    const draftToPublish = data?.draft_content || draft;

    const { error } = await supabase
      .from("site_content")
      .update({
        published_content: draftToPublish,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "active");

    if (error) throw error;
  } catch (err) {
    console.error("Error in publishDraftSiteContent to Supabase:", err);
  }
};

/**
 * Discard draft content and reload last published content in Supabase
 */
export const discardDraftSiteContent = async () => {
  let published = loadPublishedSiteContent();
  if (isBrowser) {
    window.localStorage.setItem(DRAFT_SITE_CONTENT_STORAGE_KEY, JSON.stringify(published));
  }
  try {
    const { data } = await supabase
      .from("site_content")
      .select("published_content")
      .eq("id", "active")
      .single();

    const publishedContent = data?.published_content || published;

    const { error } = await supabase
      .from("site_content")
      .update({
        draft_content: publishedContent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "active");

    if (error) throw error;
    return publishedContent;
  } catch (err) {
    console.error("Error in discardDraftSiteContent in Supabase:", err);
  }
  return published;
};

/**
 * Set preview mode status in Supabase
 */
export const setPreviewMode = async (enabled) => {
  if (isBrowser) {
    window.localStorage.setItem(PREVIEW_MODE_STORAGE_KEY, enabled ? "true" : "false");
  }
  try {
    const { error } = await supabase
      .from("site_content")
      .update({
        preview_mode: enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "active");

    if (error) throw error;
  } catch (err) {
    console.error("Error in setPreviewMode in Supabase:", err);
  }
};

/**
 * Reset all content to default values in Supabase
 */
export const resetSiteContent = async () => {
  if (isBrowser) {
    window.localStorage.removeItem(SITE_CONTENT_STORAGE_KEY);
    window.localStorage.removeItem(DRAFT_SITE_CONTENT_STORAGE_KEY);
    window.localStorage.removeItem(PREVIEW_MODE_STORAGE_KEY);
  }
  try {
    const { error } = await supabase
      .from("site_content")
      .update({
        published_content: defaultSiteContent,
        draft_content: defaultSiteContent,
        preview_mode: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "active");

    if (error) throw error;
  } catch (err) {
    console.error("Error in resetSiteContent in Supabase:", err);
  }
};

// ================= SYNCHRONOUS LEGACY CACHE BACKENDS =================

const loadContentByKey = (key) => {
  if (!isBrowser) return defaultSiteContent;
  const raw = window.localStorage.getItem(key);
  if (!raw) return defaultSiteContent;
  return mergeWithDefaults(safeParse(raw));
};

export const loadPublishedSiteContent = () => loadContentByKey(SITE_CONTENT_STORAGE_KEY);

export const loadDraftSiteContent = () => loadContentByKey(DRAFT_SITE_CONTENT_STORAGE_KEY);

export const loadDraftOrPublishedSiteContent = () => {
  if (!isBrowser) return defaultSiteContent;
  const raw = window.localStorage.getItem(DRAFT_SITE_CONTENT_STORAGE_KEY);
  if (!raw) return loadPublishedSiteContent();
  return mergeWithDefaults(safeParse(raw));
};

export const loadSiteContent = () => {
  if (!isBrowser) return defaultSiteContent;
  return isPreviewModeEnabled() ? loadDraftOrPublishedSiteContent() : loadPublishedSiteContent();
};

export const isPreviewModeEnabled = () => {
  if (!isBrowser) return false;
  return window.localStorage.getItem(PREVIEW_MODE_STORAGE_KEY) === "true";
};
