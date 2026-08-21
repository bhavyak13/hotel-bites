#!/usr/bin/env python3
import json
import re

# Load the node data
with open('figma-node-data.json', 'r', encoding='utf-8-sig') as f:
    node_data = json.load(f)

print('=== FIGMA NODE DESIGN TOKENS ===\n')

colors_found = set()
fonts_found = set()
border_radius_found = set()

def extract_from_node(node):
    """Extract design properties from node"""
    if not isinstance(node, dict):
        return
    
    # Extract fill colors
    if 'fills' in node and isinstance(node['fills'], list):
        for fill in node['fills']:
            if isinstance(fill, dict) and fill.get('type') == 'SOLID':
                color = fill.get('color', {})
                if isinstance(color, dict) and all(k in color for k in ['r', 'g', 'b']):
                    r = int(round(color['r'] * 255))
                    g = int(round(color['g'] * 255))
                    b = int(round(color['b'] * 255))
                    a = color.get('a', 1)
                    hex_color = f'#{r:02X}{g:02X}{b:02X}'
                    if hex_color != '#FFFFFF' and hex_color != '#000000':  # Skip pure white/black
                        colors_found.add(hex_color)
    
    # Extract stroke colors
    if 'strokes' in node and isinstance(node['strokes'], list):
        for stroke in node['strokes']:
            if isinstance(stroke, dict) and stroke.get('type') == 'SOLID':
                color = stroke.get('color', {})
                if isinstance(color, dict) and all(k in color for k in ['r', 'g', 'b']):
                    r = int(round(color['r'] * 255))
                    g = int(round(color['g'] * 255))
                    b = int(round(color['b'] * 255))
                    hex_color = f'#{r:02X}{g:02X}{b:02X}'
                    if hex_color != '#FFFFFF' and hex_color != '#000000':
                        colors_found.add(hex_color)
    
    # Extract corner radius
    if 'cornerRadius' in node:
        radius = node['cornerRadius']
        if radius and radius > 0:
            border_radius_found.add(radius)
    
    # Extract typography
    if 'style' in node and isinstance(node['style'], dict):
        style = node['style']
        if 'fontFamily' in style:
            fonts_found.add(style['fontFamily'])
    
    # Recurse into children
    if 'children' in node and isinstance(node['children'], list):
        for child in node['children']:
            extract_from_node(child)

# Extract from all nodes
if 'nodes' in node_data and isinstance(node_data['nodes'], dict):
    for node_id, node_content in node_data['nodes'].items():
        if 'document' in node_content:
            extract_from_node(node_content['document'])
        else:
            extract_from_node(node_content)

print('🎨 COLORS EXTRACTED:')
if colors_found:
    for color in sorted(colors_found):
        print(f'  {color}')
else:
    print('  No colors found in node fills/strokes')

print(f'\n📐 BORDER RADIUS VALUES:')
if border_radius_found:
    for radius in sorted(border_radius_found):
        print(f'  {radius}px')
else:
    print('  No border radius values found')

print(f'\n✍️ TYPOGRAPHY FAMILIES:')
if fonts_found:
    for font in sorted(fonts_found):
        print(f'  {font}')
else:
    print('  No font families found')

# Print raw structure for debugging
print('\n📊 NODE STRUCTURE:')
if 'nodes' in node_data:
    for node_id, node_content in node_data['nodes'].items():
        print(f'  Node ID: {node_id}')
        if isinstance(node_content, dict):
            if 'document' in node_content:
                doc = node_content['document']
                print(f'    - Name: {doc.get("name", "Unknown")}')
                print(f'    - Type: {doc.get("type", "Unknown")}')
                if doc.get('children'):
                    print(f'    - Children count: {len(doc["children"])}')

print('\n✅ Done!')
