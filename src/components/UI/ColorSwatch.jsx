import React from 'react';

const ColorSwatch = ({ color, isSelected, onClick }) => {
  return (
    <div
      title={`${color.name} (${color.brand})`}
      className={`color-swatch ${isSelected ? 'selected' : ''}`}
      style={{ backgroundColor: color.value }}
      onClick={() => onClick(color.value)}
    />
  );
};

const ColorGroup = ({ title, colors, selectedColor, onColorSelect }) => {
  return (
    <div className="color-category">
      <h4>{title}</h4>
      <div className="color-swatches">
        {colors.map((color) => (
          <ColorSwatch
            key={`${color.brand}-${color.name}`}
            color={color}
            isSelected={selectedColor === color.value}
            onClick={onColorSelect}
          />
        ))}
      </div>
    </div>
  );
};

export { ColorSwatch, ColorGroup };
export default ColorSwatch;
