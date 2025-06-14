import React, { useEffect, useRef } from 'react';
 
 const AdSlot = ({
  adType = 'custom', // 'adsense', 'custom', or other future types like 'meta'
  // AdSense specific props
  adClient, // Your AdSense publisher ID, e.g., "ca-pub-xxxxxxxxxxxxxxxx"
  adSlot, // The ID of the specific AdSense ad unit
  adFormat = "auto", // AdSense ad format, "auto" is usually responsive
  adLayoutKey = "", // For specific AdSense layouts like in-feed ads
  // Custom Ad specific props
  customImageUrl, // URL for your custom ad image
  customLinkUrl, // URL the custom ad image should link to
  customAltText = "Advertisement", // Alt text for custom ad image
  customHtml, // Raw HTML for a completely custom ad
  // Common props
  style = { display: 'block', textAlign: 'center' }, // Style for the main ad container div
  className = "ad-slot-wrapper", // Class for the main ad container div
 }) => {
   const adRef = useRef(null);
 
   useEffect(() => {
    const currentAdRef = adRef.current;
    if (!currentAdRef) return;
 
    // Clear previous ad content to handle prop changes correctly
    currentAdRef.innerHTML = '';

    try {
      switch (adType) {
        case 'adsense':
          if (!adClient || !adSlot) {
            console.warn("AdSense adType requires 'adClient' and 'adSlot' props.");
            currentAdRef.innerHTML = '<p style="color:red;">AdSense configuration missing (client or slot ID).</p>';
            return;
          }
          // Ensure the main AdSense script (adsbygoogle.js) is loaded, typically in public/index.html
          if (typeof window.adsbygoogle === 'undefined') {
            console.warn("AdSense script (adsbygoogle.js) not found. Make sure it's loaded.");
            currentAdRef.innerHTML = '<p style="color:black;">AdSense script not loaded.</p>';
            // Optionally, you could try to dynamically load it here, but it's generally better to have it in index.html
            return;
          }

          const ins = document.createElement('ins');
          ins.className = "adsbygoogle"; // AdSense requires this class
          // AdSense usually manages its own internal styling based on format.
          // The 'style' prop on AdSlot component controls the container.
          ins.style.display = "block"; // Common requirement for AdSense
          // ins.style.width = "100%"; // Example: make ad unit fill container width
          // ins.style.height = "auto"; // Example: auto height

          ins.setAttribute('data-ad-client', adClient);
          ins.setAttribute('data-ad-slot', adSlot);
          ins.setAttribute('data-ad-format', adFormat);
          if (adLayoutKey) {
            ins.setAttribute('data-ad-layout-key', adLayoutKey);
          }
          // For responsive ads, AdSense might also use data-full-width-responsive="true"
          // ins.setAttribute('data-full-width-responsive', "true");

          currentAdRef.appendChild(ins);
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          break;

        case 'custom':
          if (customHtml) {
            currentAdRef.innerHTML = customHtml;
          } else if (customImageUrl && customLinkUrl) {
            const link = document.createElement('a');
            link.href = customLinkUrl;
            link.target = "_blank"; // Open in new tab
            link.rel = "noopener noreferrer sponsored"; // SEO best practice for paid links

            const img = document.createElement('img');
            img.src = customImageUrl;
            img.alt = customAltText;
            img.style.maxWidth = "100%"; // Responsive image
            img.style.height = "auto";
            img.style.border = "0"; // Remove border from linked images

            link.appendChild(img);
            currentAdRef.appendChild(link);
          } else {
            console.warn("Custom adType requires 'customHtml' or ('customImageUrl' and 'customLinkUrl') props.");
            currentAdRef.innerHTML = '<p style="color:red;">Custom ad configuration missing.</p>';
          }
          break;

        // case 'meta': // Placeholder for Meta Audience Network or other engines
        //   // Add logic for Meta Audience Network ads here
        //   console.warn("Meta adType not yet implemented.");
        //   break;

        default:
          console.warn(`Unsupported adType: ${adType}`);
          currentAdRef.innerHTML = `<p style="color:red;">Unsupported ad type: ${adType}</p>`;
      }
    } catch (e) {
      console.error(`Error loading ad unit for adType '${adType}':`, e);
      currentAdRef.innerHTML = `<p style="color:red;">Error loading ad: ${e.message}</p>`;
    }
  }, [
    adType, adClient, adSlot, adFormat, adLayoutKey, 
    customImageUrl, customLinkUrl, customAltText, customHtml, 
    // style, className // These apply to the wrapper, effect doesn't need to re-run for them if only wrapper changes
  ]); // Re-run if essential ad parameters change
 
  // The style and className props are applied directly to the returned div
  return <div ref={adRef} style={style} className={className} />;
 };

export default AdSlot;