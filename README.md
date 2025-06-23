# Board Foot Calculator - Free Online Lumber Volume Calculator

A professional, modern web-based board foot calculator designed for woodworkers, contractors, and lumber professionals. Calculate lumber volume and costs with precision using our free online tool.

## 🎯 Key Features

### Core Board Foot Calculation Functions
- **Accurate Board Foot Calculation**: Automatically calculates board feet based on thickness, width, and length using the standard lumber industry formula
- **Real-time Cost Calculation**: Instantly computes total lumber costs based on price per board foot
- **Live Updates**: All calculations update automatically as you input dimensions
- **Multi-unit Support**: Convert between inches, feet, millimeters, centimeters, and meters

### Advanced Unit Conversion System
- **Thickness Units**: inches (in), millimeters (mm), centimeters (cm), meters (m), feet (ft)
- **Width Units**: inches (in), millimeters (mm), centimeters (cm), meters (m), feet (ft), feet+inches (ft+in), meters+centimeters (m+cm)
- **Length Units**: feet (ft), inches (in), millimeters (mm), centimeters (cm), meters (m), feet+inches (ft+in), meters+centimeters (m+cm)

### Smart Data Persistence Features
- **Pin Save Functionality**: Lock values using the pin button next to each input field
- **Auto Load**: Automatically restores saved values after page refresh
- **Local Storage**: Secure data storage in browser local storage, no server required
- **Cross-session Persistence**: Values remain saved between browser sessions

## 📐 Board Foot Formula

The board foot calculator uses the standard lumber industry formula:

**Board Feet = (Thickness × Width × Length × Number of Pieces) ÷ 144**

*Note: When all measurements are in inches. The calculator automatically handles unit conversions.*

## 🛠️ How to Use the Board Foot Calculator

1. **Enter Number of Pieces**: Input the quantity of lumber boards
2. **Set Board Thickness**: Enter thickness with your preferred unit
3. **Input Board Width**: Specify width with unit conversion options
4. **Enter Board Length**: Input length for volume calculation
5. **View Results**: See instant board foot calculations
6. **Add Pricing**: Enter cost per board foot for total price estimation
7. **Save Values**: Use pin buttons to lock frequently used dimensions

## 🎨 Features for Professionals

- **Multi-unit Flexibility**: Work with metric or imperial units
- **Cost Estimation**: Built-in lumber pricing calculator
- **Precision Calculations**: Accurate to 3 decimal places
- **Mobile Responsive**: Works on phones, tablets, and desktop
- **No Installation**: Browser-based tool, no downloads required
- **Free to Use**: No registration or payment required

## 🌐 SEO Keywords

Board foot calculator, lumber calculator, wood volume calculator, board feet, woodworking calculator, lumber measurement, wood calculator, board foot formula, lumber volume, wood measurement tool, lumber pricing calculator, board foot conversion, woodworking tools, lumber cost calculator.

## 📱 Compatibility

- ✅ All modern web browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile devices and tablets
- ✅ Desktop computers
- ✅ Works offline after initial load
- ✅ No plugins or extensions required

## 🔧 Technical Details

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
