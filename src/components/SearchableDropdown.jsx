import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown, FaSearch, FaTimes } from "react-icons/fa";
import "./SearchableDropdown.css";

const SearchableDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "Pilih opsi",
  searchPlaceholder = "Cari...",
  label,
  required = false,
  displayField = "name",
  valueField = "id",
  disabled = false,
  name,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Find selected option object
  const selectedOption = options.find((opt) => opt[valueField] === value);

  // Filter options based on search term
  const filteredOptions = options.filter((opt) => {
    const label = String(opt[displayField]).toLowerCase();
    return label.includes(searchTerm.toLowerCase());
  });

  const handleSelect = (option) => {
    onChange({
      target: {
        name: name,
        value: option[valueField],
      },
    });
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({
      target: {
        name: name,
        value: "",
      },
    });
  };

  return (
    <div className="sd-container" ref={dropdownRef}>
      {label && (
        <label className="sd-label">
          {label} {required && <span className="sd-required">*</span>}
        </label>
      )}

      <div
        className={`sd-header ${isOpen ? "open" : ""} ${disabled ? "disabled" : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className={`sd-selected-text ${!selectedOption ? "placeholder" : ""}`}>
          {selectedOption ? selectedOption[displayField] : placeholder}
        </div>
        
        <div className="sd-actions">
           {selectedOption && !required && !disabled && (
            <button 
                type="button"
                className="sd-clear-btn" 
                onClick={handleClear}
                title="Clear selection"
            >
              <FaTimes />
            </button>
           )}
           <FaChevronDown className={`sd-arrow ${isOpen ? "open" : ""}`} />
        </div>
      </div>

      {isOpen && (
        <div className="sd-body">
          <div className="sd-search">
            <FaSearch className="sd-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="sd-search-input"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="sd-options-list">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option[valueField]}
                  className={`sd-option ${option[valueField] === value ? "selected" : ""}`}
                  onClick={() => handleSelect(option)}
                >
                  {option[displayField]}
                  {option[valueField] === value && <span className="sd-check">✓</span>}
                </div>
              ))
            ) : (
              <div className="sd-no-options">Tidak ada hasil ditemukan</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
