import React from "react";

export default function ChartHeader({ title, rightTitle }) {
    return (
        <div className="panel-header panel-header--chart">
            <div className="ph-leftwrap">
                <div className="ph-title">{title}</div>
            </div>
            <div className="ph-righttitle">{rightTitle}</div>
        </div>
    );
}
