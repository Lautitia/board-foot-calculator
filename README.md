# Board Foot Calculator

A modern static web page board foot calculator with multi-unit conversion and value saving features.

## Key Features

### Core Calculation Functions
- **Board Foot Calculation**: Automatically calculates board feet based on thickness, width, and length
- **Cost Calculation**: Automatically calculates total cost based on unit price
- **Real-time Calculation**: Automatically updates results when inputs change

### Unit Support
- **Thickness Units**: inches (in), millimeters (mm), centimeters (cm), meters (m), feet (ft)
- **Width Units**: inches (in), millimeters (mm), centimeters (cm), meters (m), feet (ft), feet+inches (ft+in), meters+centimeters (m+cm)
- **Length Units**: feet (ft), inches (in), millimeters (mm), centimeters (cm), meters (m), feet+inches (ft+in), meters+centimeters (m+cm)

### Data Saving Features
- **Pin Save**: The 📌 button next to each input field can save the current value
- **Auto Load**: Automatically loads saved values after page refresh
- **Local Storage**: Data is saved in browser local storage, no server required

### Other Features
- **Share Results**: One-click sharing of calculation results
- **Reload**: Reset calculator to initial state
- **Clear Changes**: Clear all saved data
- **User Feedback**: Collect user feedback

## Board Foot Introduction

**Board foot** is a unit of lumber volume measurement widely used in North America (United States and Canada).

- **Definition**: 1 board foot = volume of a board 1 foot long × 1 foot wide × 1 inch thick
- **Conversion**: 1 board foot = 144 cubic inches
- **Formula**: Board feet = (thickness × width × length) ÷ 144 × number of pieces

## How to Use

1. **Enter Basic Information**
   - Number of pieces: Number of lumber pieces to calculate
   - Thickness: Lumber thickness (supports multiple units)
   - Width: Lumber width (supports multiple units)
   - Length: Lumber length (supports multiple units)

2. **Using Composite Units**
   - When selecting "ft + in" or "m + cm", a second input field will appear
   - Enter the main unit in the first field, auxiliary unit in the second field

3. **Saving Values**
   - Click the 📌 button in the upper right corner of input fields to save current values
   - Saved values will automatically load after page refresh

4. **Cost Calculation**
   - Enter price per board foot
   - System automatically calculates total cost

## Technical Features

### Design Style
- **Color Scheme**: Warm wood tones to create a professional woodworking atmosphere
- **Responsive Design**: Adapts to various screen sizes
- **Modern UI**: Clean and beautiful interface design

### Technical Implementation
- **Pure Static Page**: HTML + CSS + JavaScript, no server required
- **Local Storage**: Uses localStorage to save user data
- **Real-time Calculation**: Updates results instantly when inputs change
- **Unit Conversion**: Supports conversion between metric and imperial units

## File Structure

```
board-foot-calculator/
├── index.html          # Main page
├── styles.css          # Style file
├── script.js           # JavaScript logic
└── README.md           # Documentation
```

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Deployment Instructions

This is a pure static web project that can be deployed in the following ways:

1. **Local Preview**: Double-click the `index.html` file directly
2. **Web Server**: Upload files to any web server
3. **GitHub Pages**: Push to GitHub and enable Pages feature
4. **Netlify/Vercel**: Connect Git repository for automatic deployment

## Development Notes

### Color Scheme
- Background: `#F5F5DC` (Beige)
- Card Background: `#FFFFFF` (White, 80% opacity)
- Primary Color: `#8B4513` (Warm Brown)
- Accent Color: `#FF8C00` (Tool Orange)
- Text Color: `#333333` (Dark Gray)

### Fonts
- Headings: Roboto Slab (serif font)
- Body Text: Lato (sans-serif font)

## License

MIT License

## Change Log

### v1.0.0 (2025-06-23)
- Initial release
- Implemented basic calculation functions
- Added multi-unit conversion support
- Added data saving functionality
- Implemented responsive design
