#!/usr/bin/env python3
import json

with open('figma-full.json', 'r', encoding='utf-8-sig') as f:
    data = json.load(f)

print('=== FIGMA DESIGN TOKENS ===\n')

# Extract colors from fills
colors_found = set()
fonts_found = set()
border_radius_found = set()
font_sizes = set()

def extract_from_node(node, depth=0):
    if isinstance(node, dict):
        # Extract fill colors
        if 'fills' in node and node['fills']:
            for fill in node['fills']:
                if isinstance(fill, dict) and fill.get('type') == 'SOLID' and 'color' in fill:
                    color = fill['color']
                    if 'r' in color and 'g' in color and 'b' in color:
                        r = int(round(color['r'] * 255))
                        g = int(round(color['g'] * 255))
                        b = int(round(color['b'] * 255))
                        hex_color = f'#{r:02X}{g:02X}{b:02X}'
                        colors_found.add(hex_color)
        
        # Extract stroke colors
        if 'strokes' in node and node['strokes']:
            for stroke in node['strokes']:
                if isinstance(stroke, dict) and stroke.get('type') == 'SOLID' and 'color' in stroke:
                    color = stroke['color']
                    if 'r' in color and 'g' in color and 'b' in color:
                        r = int(round(color['r'] * 255))
                        g = int(round(color['g'] * 255))
                        b = int(round(color['b'] * 255))
                        hex_color = f'#{r:02X}{g:02X}{b:02X}'
                        colors_found.add(hex_color)
        
        # Extract corner radius
        if 'cornerRadius' in node and node['cornerRadius']:
            border_radius_found.add(str(node['cornerRadius']))
        
        # Extract typography info
        if 'style' in node:
            style = node['style']
            if isinstance(style, dict):
                if 'fontFamily' in style:
                    fonts_found.add(style['fontFamily'])
                if 'fontSize' in style:
                    font_sizes.add(str(style['fontSize']))
        
        # Recurse into children
        if 'children' in node and isinstance(node['children'], list):
            for child in node['children']:
                extract_from_node(child, depth + 1)
    elif isinstance(node, list):
        for item in node:
            extract_from_node(item, depth)

# Start extraction
if 'document' in data:
    extract_from_node(data['document'])

if 'styles' in data:
    print('📌 FIGMA STYLES:')
    for style_key, style_val in data['styles'].items():
        if isinstance(style_val, dict):
            if 'name' in style_val:
                print(f'  - {style_val["name"]} (Type: {style_val.get("type", "unknown")})')
    print()

print('🎨 COLORS FOUND:')
if colors_found:
    for color in sorted(colors_found):
        print(f'  {color}')
else:
    print('  No colors found in fills/strokes')

print(f'\n📐 BORDER RADIUS VALUES:')
if border_radius_found:
    for radius in sorted(border_radius_found, key=lambda x: float(x)):
        print(f'  {radius}px')
else:
    print('  No border radius found')

print(f'\n✍️ FONTS FOUND:')
if fonts_found:
    for font in sorted(fonts_found):
        print(f'  {font}')
else:
    print('  No fonts found')

print(f'\n📏 FONT SIZES:')
if font_sizes:
    for size in sorted(font_sizes, key=lambda x: float(x)):
        print(f'  {size}px')
else:
    print('  No font sizes found')

print('\n✅ Done!')
