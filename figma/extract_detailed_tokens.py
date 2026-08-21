#!/usr/bin/env python3
import json

with open('figma-full.json', 'r', encoding='utf-8-sig') as f:
    data = json.load(f)

print('=== FIGMA DESIGN TOKENS - DETAILED EXTRACTION ===\n')

colors_map = {}
fonts_map = {}
effects_map = {}

# Extract from styles with fill and text details
if 'styles' in data and data['styles']:
    print('📌 PROCESSING FIGMA STYLES...\n')
    for style_key, style_val in data['styles'].items():
        if isinstance(style_val, dict):
            style_name = style_val.get('name', 'Unknown')
            style_type = style_val.get('type', 'unknown')
            
            # Try to get the component reference to access fill/stroke
            if 'key' in style_val:
                key = style_val['key']
                
                # Look in components for the actual styling
                if 'components' in data and key in data['components']:
                    component = data['components'][key]
                    if 'componentMetadata' in component:
                        comp_meta = component['componentMetadata']
                        if comp_meta.get('fillPaints'):
                            # Handle fill colors
                            for paint in comp_meta.get('fillPaints', []):
                                if paint.get('type') == 'SOLID' and 'color' in paint:
                                    color = paint['color']
                                    r = int(round(color['r'] * 255))
                                    g = int(round(color['g'] * 255))
                                    b = int(round(color['b'] * 255))
                                    hex_color = f'#{r:02X}{g:02X}{b:02X}'
                                    colors_map[style_name] = hex_color

# Try another approach - look for fill-related nodes
print('📌 SEARCHING DOCUMENT STRUCTURE FOR DESIGN DATA...\n')

def extract_styles_recursive(node, depth=0):
    """Recursively extract style information from nodes"""
    if isinstance(node, dict):
        # Check if this node has fill information
        if node.get('name') and node.get('fills'):
            for fill in node.get('fills', []):
                if fill.get('type') == 'SOLID' and 'color' in fill:
                    color = fill['color']
                    r = int(round(color.get('r', 0) * 255))
                    g = int(round(color.get('g', 0) * 255))
                    b = int(round(color.get('b', 0) * 255))
                    hex_color = f'#{r:02X}{g:02X}{b:02X}'
                    
                    # Try to match with style names
                    name = node.get('name', '')
                    if name and hex_color not in colors_map.values():
                        colors_map[name] = hex_color
        
        # Check for typography
        if node.get('name') and 'style' in node:
            style = node['style']
            if isinstance(style, dict):
                font_family = style.get('fontFamily', '')
                font_weight = style.get('fontWeight', '')
                font_size = style.get('fontSize', '')
                if font_family:
                    key = f"{node.get('name')}"
                    fonts_map[key] = {
                        'family': font_family,
                        'weight': font_weight,
                        'size': font_size
                    }
        
        # Recurse into children
        if 'children' in node and isinstance(node['children'], list):
            for child in node['children']:
                extract_styles_recursive(child, depth + 1)
    elif isinstance(node, list):
        for item in node:
            extract_styles_recursive(item, depth)

# Run extraction
if 'document' in data:
    extract_styles_recursive(data['document'])

# Print results
print('🎨 COLOR PALETTE:')
if colors_map:
    for color_name in sorted(colors_map.keys()):
        hex_val = colors_map[color_name]
        print(f'  --{color_name.lower().replace(" ", "-")}: {hex_val}; /* {color_name} */')
else:
    print('  (Colors extracted from style names)')
    # Extract unique color names from styles
    style_colors = set()
    if 'styles' in data:
        for style_key, style_val in data['styles'].items():
            if isinstance(style_val, dict):
                name = style_val.get('name', '')
                # Filter out typography styles
                if name and '/Bold' not in name and '/Regular' not in name and '/Black' not in name and '/Medium' not in name and '/Extra' not in name and '/Semi' not in name and 'upper' not in name and 'lower' not in name:
                    style_colors.add(name)
    
    for color in sorted(style_colors):
        print(f'  {color}')

print('\n✍️ TYPOGRAPHY:')
if fonts_map:
    for font_name in sorted(fonts_map.keys()):
        font_info = fonts_map[font_name]
        print(f'  {font_name}:')
        print(f'    Family: {font_info["family"]}')
        if font_info['weight']:
            print(f'    Weight: {font_info["weight"]}')
        if font_info['size']:
            print(f'    Size: {font_info["size"]}px')
else:
    # Extract font families from style names
    fonts = set()
    if 'styles' in data:
        for style_key, style_val in data['styles'].items():
            if isinstance(style_val, dict):
                name = style_val.get('name', '')
                if '/' in name:
                    font_fam = name.split('/')[0]
                    fonts.add(font_fam)
    
    print('  Fonts found in styles:')
    for font in sorted(fonts):
        print(f'    - {font}')

# Try to find color definitions by parsing the actual component metadata
print('\n📊 EXTRACTING COMPONENT FILL DATA...')
if 'components' in data:
    component_colors = {}
    for comp_key, component in data['components'].items():
        if 'componentMetadata' in component:
            meta = component['componentMetadata']
            # This might have the color data
            if 'fillPaints' in meta or 'fills' in component:
                fills = component.get('fills', meta.get('fillPaints', []))
                if fills and isinstance(fills, list):
                    for fill in fills:
                        if isinstance(fill, dict) and fill.get('type') == 'SOLID':
                            color_data = fill.get('color', {})
                            if all(k in color_data for k in ['r', 'g', 'b']):
                                r = int(round(color_data['r'] * 255))
                                g = int(round(color_data['g'] * 255))
                                b = int(round(color_data['b'] * 255))
                                hex_color = f'#{r:02X}{g:02X}{b:02X}'
                                comp_name = component.get('name', comp_key)
                                component_colors[comp_name] = hex_color

    if component_colors:
        print('\n🔧 COMPONENT COLORS:')
        for comp_name in sorted(component_colors.keys()):
            hex_val = component_colors[comp_name]
            print(f'  {comp_name}: {hex_val}')

print('\n✅ Extraction complete!')
print('\nNote: Most data is stored in style names. Check Figma UI for exact RGB/Hex values.')
