/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded OKIT Properties Javascript');

class OkitResourceProperties {
    resource_tabs = []
    constructor (resource, resource_tabs=[]) {
        this.resource = resource
        this.resource_tabs = resource_tabs
        this.id = this.resource ? this.toId(this.resource.resource_type) : 'missing'
        this.properties_div = '<div></div>'
        this.build()
    }
    // Standard Data
    // Availability Domain
    ad_data = {
        options: {
            1: 'Availability Domain 1', 
            2: 'Availability Domain 2', 
            3: 'Availability Domain 3'
        }
    }
    // Fault Domain
    fd_data = {
        options: {
            '': 'Let Oracle Choose', 
            'FAULT-DOMAIN-1': 'Fault Domain 1', 
            'FAULT-DOMAIN-2': 'Fault Domain 2', 
            'FAULT-DOMAIN-3': 'Fault Domain 3'
        }
    }
    // DNS Label
    dns_data = {
        maxlength: '15',
        pattern: '^[a-zA-Z][a-zA-Z0-9]{0,15}$',
        title: 'Only letters and numbers, starting with a letter. 15 characters max.'
    }
    // Hostname Label
    hostname_data = {
        maxlength: '64',
        pattern: '^[a-zA-Z][a-zA-Z0-9]{0,64}$',
        title: 'Only letters and numbers, starting with a letter. 64 characters max.'
    }
    // Alphanumeric, Hyphon & Underscore
    spaceless_name_data = {
        pattern: '^[\\w-]*$',
        title: 'Only alphanumeric characters, dashes, and underscores.'
    }
    // Port Data
    port_range_data = {
        min: 0,
        max: 65535
    }

    // Common Filters
    compartment_filter = (r) => r.compartment_id.toString() === this.resource.compartment_id.toString()
    vcn_filter = (r) => r.vcn_id.toString() === this.resource.vcn_id.toString()
    subnet_filter = (r) => r.subnet_id.toString() === this.resource.subnet_id.toString()
    oci_defined_filter = (r) => r.compartment_id === null
    user_defined_filter = (r) => r.compartment_id !== null
    nsg_filter = (r) => r.vcn_id === [...(this.resource.okit_json.subnet ? this.resource.okit_json.subnet : this.resource.okit_json.subnets ? this.resource.okit_json.subnets : [])].filter((s) => s.id === this.resource.subnet_id)[0].vcn_id
    fss_filter = (r) => r.availability_domain.toString() === this.resource.availability_domain.toString()

    // Build Sheet
    build() {
        if (this.resource) {
            this.buildBaseSheet()
            this.buildCore()
            this.buildResource()
            this.buildTags()
        }
    }

    buildBaseSheet() {
        const self = this
        const tabs = ['Properties', ...this.resource_tabs, 'Documentation', 'Tags']
        this.properties_div = d3.create('div')
                                .attr('id', `${self.id}_editor`)
                                .attr('class', 'okit-property-editor')
        this.title = this.properties_div.append('div')
                                .attr('class', `property-editor-title ${this.resource.resource_type.toLowerCase().replaceAll(' ', '-')}`)
                                .append('h3')
                                .attr('class', `heading-background ${self.resource.read_only ? 'padlock-closed' : 'padlock-open'}`)
                                    .text(this.resource.resource_type)
        this.panel = this.properties_div.append('div')
                                .attr('id', `${self.id}_panel`)
                                .attr('class', 'okit-resource-properties-panel')
        this.tabbar = this.panel.append('div')
                                .attr('id', `${self.id}_tab_bar`)
                                .attr('class', 'okit-tab-bar')
        tabs.forEach((name, i) => {
            const tab_id = name.toLowerCase().replaceAll(' ', '_')
            self[`${tab_id}_btn`] = self.tabbar.append('button')
                                        .attr('id', `${self.id}_${tab_id}_tab`)
                                        .attr('class', `okit-tab ${i === 0 ? 'okit-tab-active' : ''}`)
                                        .text(name)
                                        .on('click', () => {
                                            $(`#${self.id}_panel .okit-tab-contents`).addClass('hidden')
                                            $(`#${self.id}_panel .okit-tab`).removeClass('okit-tab-active')
                                            $(`#${self.id}_${tab_id}_tab`).addClass('okit-tab-active')
                                            $(`#${self.id}_${tab_id}_contents`).removeClass('hidden')
                                        })
            self[`${tab_id}_contents`] = this.panel.append('div')
                                            .attr('id', `${self.id}_${tab_id}_contents`)
                                            .attr('class', `okit-tab-contents ${i > 0 ? 'hidden' : ''} ${self.resource.read_only && name !== 'Documentation' ? 'read-only' : ''}`)
        })
    
        // console.info('Properties div', this.properties_div)
    }

    buildCore() {
        const self = this
        const core = this.createDetailsSection('Core', `${self.id}_core_details`)
        this.append(this.properties_contents, core.details)
        const properties = this.createTable('', `${self.id}_core_properties`)
        this.core_tbody = properties.tbody
        this.append(core.div, properties.table)
        const ocid_data = {
            readonly: true
        }
        const ocid = this.createInput('text', 'Ocid', `${self.id}_ocid`, '', undefined, ocid_data)
        this.ocid = ocid.input
        this.append(this.core_tbody, ocid.row)
        ocid.row.classed('collapsed', !okitSettings.show_ocids)
        const display_name = this.createInput('text', 'Name', `${self.id}_display_name`, '', (d, i, n) => {this.resource.display_name = n[i].value; this.redraw(); this.setTitle(); this.handleDisplayNameChange()})
        this.display_name = display_name.input
        this.append(this.core_tbody, display_name.row)
        this.documentation_contents.append('textarea')
                                    .attr('id', `${self.id}_documentation`)
                                    .attr('class', 'resource-documentation')
                                    .attr('name', 'documentation')
                                    .attr('wrap', 'soft')
                                    .attr('placeholder', `Markdown documentation for this ${this.resource.resource_type} resource`)
                                    .on('change', (d, i, n) => self.resource.documentation = n[i].value)
    }

    buildResource() {}

    buildTags() {
        const self = this
        // Freeform Tags
        const fft = this.createDetailsSection('Freeform Tags', `${self.id}_fft_details`)
        this.append(this.tags_contents, fft.details)
        const fft_table = this.createTable('', `${self.id}_fftags`)
        this.fft_tbody = fft_table.tbody
        this.append(fft.details, fft_table.table)
        let row = fft_table.thead.append('div').attr('class', 'tr')
        row.append('div').attr('class', 'th').text('Key')
        row.append('div').attr('class', 'th').text('Value')
        row.append('div').attr('class', 'th add-tag action-button-background action-button-column').on('click', () => handleAddFreeformTag(self.resource, () => self.loadFreeformTags()))
        // Defined Tags
        const dt = this.createDetailsSection('Defined Tags', `${self.id}_dt_details`)
        this.append(this.tags_contents, dt.details)
        const dt_table = this.createTable('', `${self.id}_dtags`)
        this.dt_tbody = dt_table.tbody
        this.append(dt.details, dt_table.table)
        row = dt_table.thead.append('div').attr('class', 'tr')
        row.append('div').attr('class', 'th').text('Namespace')
        row.append('div').attr('class', 'th').text('Key')
        row.append('div').attr('class', 'th').text('Value')
        row.append('div').attr('class', 'th add-tag action-button-background action-button-column').on('click', () => handleAddDefinedTag(self.resource, () => self.loadDefinedTags()))
    }

    setTitle = () => this.title.text(`${this.resource.resource_type} (${this.resource.display_name})`)
    handleDisplayNameChange = () => {}

    load() {
        if (this.resource) {
            this.loadCore()
            this.loadResource()
            this.loadTags()
        }
    }

    loadCore() {
        this.ocid.property('value', this.resource.id)
        okitSettings.show_ocids ? this.showProperty(`${this.id}_ocid`, '') : this.hideProperty(`${this.id}_ocid`, '')
        this.display_name.property('value', this.resource.display_name)
        this.setTitle()
    }

    loadResource() {}

    loadTags() {
        this.loadFreeformTags()
        this.loadDefinedTags()
    }

    loadFreeformTags() {
        const self = this
        this.fft_tbody.selectAll('*').remove()
        for (const [key, value] of Object.entries(this.resource.freeform_tags)) {
            let tr = this.fft_tbody.append('div').attr('class', 'tr')
            tr.append('div').attr('class', 'td').append('label').text(key)
            tr.append('div').attr('class', 'td').append('label').text(value)
            tr.append('div').attr('class', 'td delete-tag action-button-background delete').on('click', () => {
                delete this.resource.freeform_tags[key];
                self.loadFreeformTags()
                d3.event.stopPropagation()
            })
        }
    }

    loadDefinedTags() {
        const self = this
        this.dt_tbody.selectAll('*').remove()
        for (const [namespace, tags] of Object.entries(this.resource.defined_tags)) {
            for (const [key, value] of Object.entries(tags)) {
                let tr = this.dt_tbody.append('div').attr('class', 'tr')
                tr.append('div').attr('class', 'td').append('label').text(namespace)
                tr.append('div').attr('class', 'td').append('label').text(key)
                tr.append('div').attr('class', 'td').append('label').text(value)
                tr.append('div').attr('class', 'td  delete-tag action-button-background delete').on('click', () => {
                    delete this.resource.defined_tags[namespace][key];
                    if (Object.keys(this.resource.defined_tags[namespace]).length === 0) {delete this.resource.defined_tags[namespace];}
                    self.loadDefinedTags()
                    d3.event.stopPropagation()
                })
            }
        }
    }

    show(parent) {
       parent.childNodes.length > 0 ? parent.replaceChild(this.properties_div.node(), parent.childNodes[0]) : parent.appendChild(this.properties_div.node()) 
    }

    toId(name) {
        return name.replaceAll(' ', '_').toLowerCase()
    }

    /*
    ** Property Creation Routines
    */   
    append = (parent, child) => parent.append(() => child.node())

    // Formatting
    formatting = {
        // IPv4 IP Address
        ipv4: {
            placeholder: '0.0.0.0',
            pattern: "^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$)+",
            title: 'IPv4 Address'
        },
        // IPv4 CIDR
        ipv4_cidr: {
            placeholder: '0.0.0.0/0',
            pattern: "^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))$)+",
            title: 'IPv4 CIDR block'
        },
        // IPv4 CIDR List
        ipv4_cidr_list: {
            placeholder: '0.0.0.0/0,0.0.0.0/0',
            pattern: "^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))(,\s?|$))+",
            title: 'Comma separated IPv4 CIDR blocks'
        },
        // IPv6 CIDR List
        ipv6_cidr_list: {
            placeholder: '2001:0db8:0123:45::/56',
            pattern: "^((((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*::((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*|((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4})){7})(,\s?|$))+",
            title: 'Comma separated IPv6 CIDR blocks'
        },
        // Port Range
        port_range: {
            placeholder:'80, 20-22',
            pattern: "(^$|^(?:[1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])(?:-([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?$)",
            title: 'Port range 80, 20-22'
        },
        dns_name: {
            pattern: "^[\w\._-]+$"
        }
    }

    createInput(type='text', label='', id='', idx='', callback=undefined, data={}) {
        const row = d3.create('div').attr('class', 'tr').attr('id', this.trId(id, idx))
        let input = undefined
        let cell = undefined
        let title = undefined
        // Check for special formatting type e.g. ipv4
        if (Object.keys(this.formatting).includes(type)) {
            data = data ? {...data, ...this.formatting[type]} : formatting[type]
            type = 'text'
        }
        if (['text', 'password', 'email', 'date', 'number', 'range'].includes(type)) {
            title = row.append('div').attr('class', 'td property-label').text(label)
            cell = row.append('div').attr('class', 'td')
            input = cell.append('input').attr('name', this.inputId(id, idx)).attr('id', this.inputId(id, idx)).attr('type', type).attr('class', 'okit-property-value').attr('list', 'variables_datalist').on('change', callback).on('blur', (d, i, n) => n[i].reportValidity())
            this.addExtraAttributes(input, data)
            // return this.createSimplePropertyRow(type, label, id, idx, callback, data)
        } else if (type === 'select') {
            title = row.append('div').attr('class', 'td property-label').text(label)
            input = row.append('div').attr('class', 'td').append('select').attr('id', this.inputId(id, idx)).attr('class', 'okit-property-value').on('change', callback)
            if (data && data.options) {
                Object.entries(data.options).forEach(([k, v]) => input.append('option').attr('value', k).text(v))
            }
        } else if (type === 'multiselect') {
            title = row.append('div').attr('class', 'td property-label').text(label)
            input = row.append('div').attr('class', 'td').append('div').attr('id', this.inputId(id, idx)).attr('class', 'okit-multiple-select').on('change', callback)
        } else if (type === 'checkbox') {
            row.append('div').attr('class', 'td property-label')
            cell = row.append('div').attr('class', 'td')
            input = cell.append('input').attr('type', 'checkbox').attr('id', this.inputId(id, idx)).attr('class', 'okit-property-value').on('input', callback)
            cell.append('label').attr('for', this.inputId(id, idx)).text(label)
        } else {
            alert(`Unknown Type ${type}`)
        }
        return {row: row, cell: cell, input: input, title: title}
    }
    createSimplePropertyRow(type='text', label='', id='', idx=0, callback=undefined, data={}) {
        const row = d3.create('div').attr('class', 'tr').attr('id', this.trId(id, idx))
        row.append('div').attr('class', 'td property-label').text(label)
        const input = this.createSimpleInputCell(type, id, idx, callback, data)
        this.append(input.row, input.cell)
        return {row: input.row, cell: input.cell, input: input.input}
    }
    createSimpleInputCell(type='text', id='', idx=0, callback=undefined, data={}) {
        const cell = d3.create('div').attr('class', 'td')
        const input = this.createSimpleInput(type, id, idx, callback, data)
        this.append(cell, input)
        return {cell: cell, input: input}
    }
    createSimpleInput(type='text', id='', idx=0, callback=undefined, data={}) {
        const input = d3.create('input').attr('name', this.inputId(id, idx)).attr('id', this.inputId(id, idx)).attr('type', type).attr('class', 'okit-property-value').on('blur', callback)
        this.addExtraAttributes(input, data)
        return input
    }

    addExtraAttributes(input, data) {
        const attributes = ['min', 'max', 'step', 'maxlength', 'pattern', 'title', 'placeholder', 'readonly']
        if (data) {
            Object.entries(data).forEach(([k, v]) => {
                if (attributes.includes(k)) input.attr(k, v)
            })
        }
        if (data.classes) data.classes.forEach((c) => input.classed(c, true))
    }

    createTextArea(id='', idx='', callback=undefined, data={}) {
        const textarea = d3.create('textarea')
            .attr('id', this.inputId(id, idx))
            .attr('class', 'resource-documentation')
            .attr('name', this.inputId(id, idx))
            .attr('wrap', 'soft')
            .on('change', callback)
        this.addExtraAttributes(textarea, data)
        return {input: textarea}
    }

    createTable(label='', id='', idx='', callback=undefined, data={}) {
        const table = d3.create('div').attr('class', 'table okit-table')
        const thead = table.append('div').attr('class', 'thead')
        const tbody = table.append('div').attr('class', 'tbody').attr('id', this.tbodyId(id, idx))
        return {table: table, thead: thead, tbody: tbody}
    }

    createPropertiesTable(label='', id='', idx='', callback=undefined, data={}) {
        const elements = this.createTable(label, id, idx, callback, data)
        const row = elements.thead.append('div').attr('class', 'tr')
        row.append('div').attr('class', 'th').text('Property')
        row.append('div').attr('class', 'th').text('Value')
        return {table: table, thead: thead, tbody: tbody}
    }

    createArrayTable(label='', id='', idx='', callback=undefined, data={}) {
        const elements = this.createTable(label, id, idx, callback, data)
        const row = elements.thead.append('div').attr('class', 'tr')
        row.append('div').attr('class', 'th').text(label)
        row.append('div').attr('class', 'th add-property action-button-background action-button-column').on('click', callback)
        return elements
    }

    createDetailsSection(label='', id='', idx='', callback=undefined, data={}, open=true) {
        // const details = d3.create('details').attr('class', 'okit-details').attr('open', open)
        const details = d3.create('details').attr('class', 'okit-details').on('toggle', callback)
        if (open) details.attr('open', open)
        const summary = details.append('summary').attr('class', 'summary-background').append('label').text(label)
        const div = details.append('div').attr('class', 'okit-details-body')
        return {details: details, summary: summary, div: div}
    }

    createDeleteRow(id='', idx='', callback=undefined, data={}) {
        const row = d3.create('div').attr('class', 'tr').attr('id', this.trId(id, idx))
        const div = row.append('div').attr('class', 'td')
        row.append('div').attr('class', 'td delete-property action-button-background delete').on('click', callback)
        return {row: row, div: div}
    }

    createMultiValueRow(label='', id='', idx='', callback=undefined, data={}) {
        const row = d3.create('div').attr('class', 'tr').attr('id', this.trId(id, idx))
        row.append('div').attr('class', 'td').text(label)
        const div = row.append('div').attr('class', 'td multi-value').append('div').attr('class', 'tr')
        return {row: row, div: div}
    }

    tbodyId = (id, idx) => `${id.replaceAll(' ', '_').toLowerCase()}_tbody${idx}`
    trId = (id, idx) => `${id.replaceAll(' ', '_').toLowerCase()}${idx}_row`
    inputId = (id, idx) => `${id.replaceAll(' ', '_').toLowerCase()}${idx}`

    hideProperty = (id, idx) => d3.select(`#${this.trId(id, idx)}`).classed('collapsed', true)
    showProperty = (id, idx) => d3.select(`#${this.trId(id, idx)}`).classed('collapsed', false)
    setPropertyValue = (id, idx, val) => d3.select(`#${this.inputId(id, idx)}`).property('value', val)

    loadSelect(select, resource_type, empty_option=false, filter=() => true, empty_value='', id_element='id', display_element='display_name') {
        select.selectAll('*').remove()
        if (!filter) filter = () => true
        if (empty_option) select.append('option').attr('value', '').text(empty_value ? empty_value : '')
        let id = ''
        const resources = this.resource.okit_json[`${resource_type}s`] ? this.resource.okit_json[`${resource_type}s`] : this.resource.okit_json[`${resource_type}`] ? this.resource.okit_json[`${resource_type}`] : []
        resources.filter(filter).forEach((r, i) => {
            const option = select.append('option').attr('value', r[id_element]).text(r[display_element])
            if (i === 0) {
                option.attr('selected', 'selected')
                id = r[id_element]
            }
        })
        return id
    }

    loadReferenceSelect(select, resource_type, empty_option=false, filter=undefined, groups=undefined, empty_value='') {
        select.selectAll('*').remove()
        filter = filter ? filter : () => true
        if (empty_option) select.append('option').attr('value', '').attr('selected', 'selected').text(empty_value ? empty_value : '')
        let id = ''
        const resources = okitOciData[resource_type](filter)
        console.info('Resources', resources)
        if (groups) {
            Object.entries(groups).forEach(([k, v]) => {
                const optgrp = select.append('optgroup').attr('label', k)
                resources.filter(v).forEach((r, i) => {
                    r = r instanceof Object ? r : {id: r, display_name: r}
                    const option = optgrp.append('option').attr('value', r.id).text(r.display_name)
                    if (!empty_option && i === 0 && id === '') {
                        option.attr('selected', 'selected')
                        id = r.id
                    }
                })
            })
        } else {
            filter = () => true
            resources.filter(filter).forEach((r, i) => {
                r = r instanceof Object ? r : {id: r, display_name: r}
                const option = select.append('option').attr('value', r.id).text(r.display_name)
                if (!empty_option && i === 0) {
                    option.attr('selected', 'selected')
                    id = r.id
                }
            })
        }
        return id
    }

    loadMultiSelect(select, resource_type, empty_option=false, filter=undefined) {
        select.selectAll('*').remove()
        if (!filter) filter = () => true
        const resources = this.resource.okit_json[`${resource_type}s`] ? this.resource.okit_json[`${resource_type}s`] : this.resource.okit_json[`${resource_type}`] ? this.resource.okit_json[`${resource_type}`] : []
        resources.filter(filter).forEach((r) => {
            const div = select.append('div')
            const safeid = r.id.replace(/[\W_]+/g,"_")
            div.append('input').attr('type', 'checkbox').attr('id', safeid).attr('value', r.id)
            div.append('label').attr('for', safeid).text(r.display_name)
        })
    }

    loadSelectFromMap(select, map) {
        select.selectAll('*').remove()
        map.forEach((v, t) => select.append('option').attr('value', v).text(t))
    }

    setMultiSelect(select, ids) {
        const cbs = [...document.querySelectorAll(`#${select.attr('id')} input[type="checkbox"]`)]
        cbs.forEach((c) => c.checked = ids.includes(c.value) )
    }

    /*
    ** Redraw
    */
    redraw = () => okitJsonView.update()
}
