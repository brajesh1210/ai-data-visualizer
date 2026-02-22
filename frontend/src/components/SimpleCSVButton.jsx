export default function SampleCSVButton() {
    function handleDownload() {
        const csv = [
            'Month,Sales,Region',
            'January,15000,North',
            'February,18000,South',
            'March,12000,East',
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_data.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <button
            onClick={handleDownload}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold
        bg-golden-600 text-white hover:bg-golden-500
        transition-all duration-200 shadow-md shadow-golden-600/20 hover:shadow-golden-500/30
        active:scale-[0.97]"
        >
            📥 Download Sample CSV
        </button>
    );
}