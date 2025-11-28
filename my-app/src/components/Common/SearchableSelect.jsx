import { useState, useEffect, useRef } from 'react';

const SearchableSelect = ({
    options = [],
    value,
    onChange,
    placeholder = "Select...",
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    const filteredOptions = options.filter(opt => {
        const search = searchTerm.toLowerCase();
        const labelMatch = opt.label?.toLowerCase().includes(search);
        const codeMatch = opt.code?.toLowerCase().includes(search);
        return labelMatch || codeMatch;
    });

    return (
        <div className={`position-relative ${className}`} ref={wrapperRef}>
            <div
                className="form-select"
                onClick={() => setIsOpen(!isOpen)}
                style={{ cursor: 'pointer', backgroundColor: '#fff', userSelect: 'none' }}
            >
                {selectedOption ? (
                    <span>
                        {selectedOption.code ? <strong>{selectedOption.code} - </strong> : ''}
                        {selectedOption.label}
                    </span>
                ) : (
                    <span className="text-muted">{placeholder}</span>
                )}
            </div>

            {isOpen && (
                <div className="position-absolute w-100 mt-1 shadow-sm border rounded bg-white" style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}>
                    <div className="p-2 sticky-top bg-white border-bottom">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Tìm kiếm tên hoặc mã..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="list-group list-group-flush">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={`list-group-item list-group-item-action ${opt.value === value ? 'active' : ''}`}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                        setSearchTerm("");
                                    }}
                                >
                                    {opt.code && <strong className="me-2">{opt.code}</strong>}
                                    {opt.label}
                                </button>
                            ))
                        ) : (
                            <div className="p-3 text-center text-muted">Không tìm thấy kết quả</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
