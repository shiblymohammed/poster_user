import { SIZE_OPTIONS, type SizeOption } from '../constants/sizeOptions';

interface SizeSelectorProps {
  selectedSize: SizeOption;
  onSizeSelect: (size: SizeOption) => void;
}

function SizeSelector({ selectedSize, onSizeSelect }: SizeSelectorProps) {
  return (
    <div className="size-selector">
      <h3>Choose Output Size</h3>
      <p className="size-selector-subtitle">Select the perfect size for your needs</p>
      
      <div className="size-options">
        {SIZE_OPTIONS.map((size) => (
          <div
            key={size.id}
            className={`size-option ${selectedSize.id === size.id ? 'selected' : ''}`}
            onClick={() => onSizeSelect(size)}
          >
            <div className="size-icon">{size.icon}</div>
            <div className="size-info">
              <div className="size-name">{size.name}</div>
              <div className="size-ratio">{size.ratio} • {size.width}×{size.height}</div>
              <div className="size-description">{size.description}</div>
            </div>
            {selectedSize.id === size.id && (
              <div className="size-check">✓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SizeSelector;
