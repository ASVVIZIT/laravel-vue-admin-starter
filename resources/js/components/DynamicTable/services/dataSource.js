// resources/js/components/DynamicTable/services/dataSource.js
import { MockDataService } from './mockDataService';
import { ApiService } from './apiService';

export class DataSource {
    constructor() {
        this.currentSource = 'api'; // 'api' или 'mock'
        this.sources = {
            'api': new ApiService(),
            'mock': new MockDataService()
        };
    }

    setSource(source) {
        if (this.sources[source]) {
            this.currentSource = source;
            console.log(`[DataSource] Источник данных изменен на: ${source}`);
            return true;
        }
        console.error(`[DataSource] Неизвестный источник данных: ${source}`);
        return false;
    }

    getSource() {
        return this.sources[this.currentSource];
    }

    // Методы-обертки для упрощения использования
    fetchTemplate(templateId) {
        return this.getSource().fetchTemplate(templateId);
    }

    fetchTableData(params) {
        return this.getSource().fetchTableData(params);
    }

    fetchChildRows(params) {
        return this.getSource().fetchChildRows(params);
    }

    createRow(data) {
        return this.getSource().createRow(data);
    }

    updateRow(id, data) {
        return this.getSource().updateRow(id, data);
    }

    deleteRow(id) {
        return this.getSource().deleteRow(id);
    }
}

export const dataSource = new DataSource();
