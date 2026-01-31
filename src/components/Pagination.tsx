import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
}) => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div className="pagination">
            <button
                className="pagination-btn"
                onClick={() => onPageChange(0)}
                disabled={currentPage === 0}
                title="First page"
            >
                ««
            </button>
            <button
                className="pagination-btn"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                title="Previous page"
            >
                «
            </button>

            {startPage > 0 && (
                <>
                    <button className="pagination-btn" onClick={() => onPageChange(0)}>
                        1
                    </button>
                    {startPage > 1 && <span className="pagination-ellipsis">...</span>}
                </>
            )}

            {pages.map((page) => (
                <button
                    key={page}
                    className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                    onClick={() => onPageChange(page)}
                >
                    {page + 1}
                </button>
            ))}

            {endPage < totalPages - 1 && (
                <>
                    {endPage < totalPages - 2 && <span className="pagination-ellipsis">...</span>}
                    <button
                        className="pagination-btn"
                        onClick={() => onPageChange(totalPages - 1)}
                    >
                        {totalPages}
                    </button>
                </>
            )}

            <button
                className="pagination-btn"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                title="Next page"
            >
                »
            </button>
            <button
                className="pagination-btn"
                onClick={() => onPageChange(totalPages - 1)}
                disabled={currentPage === totalPages - 1}
                title="Last page"
            >
                »»
            </button>
        </div>
    );
};

export default Pagination;
