# 🎨 Test Admonition Colors and Icons

This file tests all admonition types with their specific colors and icons.

## Basic Admonitions

!!! note "Note Title"
    Blue informational blocks with ℹ️ icon
    Border should be #448aff (blue)

!!! tip "Tip Title"
    Green helpful suggestions with 💡 icon
    Border should be #00bfa5 (teal/green)

!!! warning "Warning Title"
    Orange cautionary blocks with ⚠️ icon
    Border should be #ff9100 (orange)

!!! danger "Danger Title"
    Red critical alerts with 🚨 icon
    Border should be #ff1744 (red)

## Extended Admonitions

!!! success "Success Title"
    Green success indicators with ✅ icon
    Border should be #00c853 (green)

!!! info "Info Title"
    Cyan informational blocks with ℹ️ icon
    Border should be #00b8d4 (cyan)

!!! question "Question Title"
    Light green FAQ blocks with ❓ icon
    Border should be #64dd17 (light green)

!!! quote "Quote Title"
    Gray citation blocks with 💬 icon
    Border should be #9e9e9e (gray)

## Special Admonitions

!!! abstract "Abstract Title"
    Light blue abstract blocks with 📋 icon
    Border should be #00bcd4 (light blue)

!!! bug "Bug Title"
    Pink bug reports with 🐛 icon
    Border should be #f50057 (pink)

!!! example "Example Title"
    Purple example blocks with 🧪 icon
    Border should be #7c4dff (purple)

!!! failure "Failure Title"
    Light red failure blocks with ❌ icon
    Border should be #ff5252 (light red)

## Expected Results

Each admonition should have:
- ✅ Unique border color
- ✅ Matching title background color (10% opacity)
- ✅ Specific emoji/icon in the title
- ✅ Proper dark theme compatibility

If all admonitions appear blue, the color-specific CSS is not being applied correctly. 