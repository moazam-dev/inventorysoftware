import React from 'react'
import { Button, ButtonGroup } from 'react-bootstrap'

const YearPicker = ({ years, selectedYear, onSelect }) => {
    return (
        <div className="mb-4">
            <h5 className="text-muted mb-3">Select Year</h5>
            <ButtonGroup>
                {years.map(year => (
                    <Button
                        key={year}
                        variant={selectedYear === year ? 'primary' : 'outline-primary'}
                        onClick={() => onSelect(year)}
                    >
                        {year}
                    </Button>
                ))}
                {years.length === 0 && <Button variant="outline-secondary" disabled>No Data</Button>}
            </ButtonGroup>
        </div>
    )
}

export default YearPicker
