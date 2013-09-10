/*global define*/
define([
        '../../Core/createGuid',
        '../../Core/defined',
        '../../Core/defineProperties',
        '../../Core/destroyObject',
        '../../Core/DeveloperError',
        './DataSourceBrowserViewModel',
        '../getElement',
        '../../ThirdParty/knockout'
    ], function(
        createGuid,
        defined,
        defineProperties,
        destroyObject,
        DeveloperError,
        DataSourceBrowserViewModel,
        getElement,
        knockout) {
    "use strict";

    var DataSourceBrowser = function(container, dataSourceCollection) {
        if (!defined(container)) {
            throw new DeveloperError('container is required.');
        }

        if (!defined(dataSourceCollection)) {
            throw new DeveloperError('dataSourceCollection is required.');
        }

        container = getElement(container);

        this._container = container;

        var viewModel = new DataSourceBrowserViewModel(dataSourceCollection);
        this._viewModel = viewModel;

        var element = document.createElement('div');
        element.className = 'cesium-dataSourceBrowser';

        var templateID = 'cesium-dataSourceBrowser-template-' + createGuid();
        var templateElement = document.createElement('script');
        templateElement.type = 'text/html';
        templateElement.id = templateID;
        templateElement.textContent = '<li>\
<!-- ko if: hasChildren -->\
<input type="checkbox" data-bind="attr: { id: id }, checked: expanded">\
<label data-bind="attr: { for: id }, text: name, css: { \'cesium-dataSourceBrowser-item\': true, \
    \'cesium-dataSourceBrowser-item-selected\': isSelected }"></label>\
<ul data-bind="template: { name: \'' + templateID + '\', foreach: children }"></ul>\
<!-- /ko -->\
<!-- ko ifnot: hasChildren -->\
<span data-bind="text: name, click: select, css: { \'cesium-dataSourceBrowser-item\': true, \
    \'cesium-dataSourceBrowser-item-selected\': isSelected }"></span>\
<!-- /ko -->';
        element.appendChild(templateElement);

        var dataSourcesContainer = document.createElement('div');
        dataSourcesContainer.className = 'cesium-dataSourceBrowser-dataSourcesContainer';
        dataSourcesContainer.setAttribute('data-bind', 'style : { maxHeight : maxHeightOffset(25) }');
        element.appendChild(dataSourcesContainer);

        var dataSourcesToolbar = document.createElement('div');
        dataSourcesToolbar.className = 'cesium-dataSourceBrowser-dataSourcesToolbar';
        dataSourcesContainer.appendChild(dataSourcesToolbar);

/*
        var addDataSourceButton = document.createElement('span');
        addDataSourceButton.className = 'cesium-dataSourceBrowser-button';
        addDataSourceButton.textContent = '+ Add';
        addDataSourceButton.setAttribute('data-bind', '\
attr: { title: addDataSourceTooltip },\
click: addDataSourceCommand');
        dataSourcesToolbar.appendChild(addDataSourceButton);
*/

        var dataSourcesRootElement = document.createElement('ul');
        dataSourcesRootElement.className = 'cesium-dataSourceBrowser-dataSources';
        dataSourcesRootElement.setAttribute('data-bind', '\
template: { name: "' + templateID + '", foreach: dataSourceViewModels }');
        dataSourcesContainer.appendChild(dataSourcesRootElement);

        var dataSourcePanelContainer = document.createElement('div');
        dataSourcePanelContainer.className = 'cesium-dataSourceBrowser-dataSourcePanelContainer';
        dataSourcePanelContainer.setAttribute('data-bind', '\
with: dataSourcePanelViewModel,\
css: { "cesium-dataSourceBrowser-dataSourcePanelContainer-visible" : dataSourcePanelViewModel.visible,\
       "cesium-dataSourceBrowser-dataSourcePanelContainer-hidden" : !dataSourcePanelViewModel.visible }');
        element.appendChild(dataSourcePanelContainer);

        var dataSourcePanelHeader = document.createElement('div');
        dataSourcePanelHeader.className = 'cesium-dataSourceBrowser-dataSourcePanelContainer-header';
        dataSourcePanelHeader.textContent = 'Add Data Source';
        dataSourcePanelContainer.appendChild(dataSourcePanelHeader);

        var dataSourceOptions = document.createElement('span');
        dataSourceOptions.className = 'cesium-dataSourceBrowser-dataSourcePanelContainer-dataSourceOptions';
        dataSourceOptions.setAttribute('data-bind', '\
foreach: dataSourcePanelViewModel.dataSourcePanels');
        dataSourcesToolbar.appendChild(dataSourceOptions);

        var dataSourceOption = document.createElement('div');
        dataSourceOption.setAttribute('data-bind', '\
text : "+ " + description,\
css: { "cesium-dataSourceBrowser-button" : true, \
       "cesium-dataSourceBrowser-dataSourcePanelContainer-dataSourceSelected" : $data === $parent.dataSourcePanelViewModel.activeDataSourcePanel },\
click: function($data) { $parent.dataSourcePanelViewModel.visible = true; $parent.dataSourcePanelViewModel.activeDataSourcePanel = $data }');
        dataSourceOptions.appendChild(dataSourceOption);

        var activeDataSourcePanelContainer = document.createElement('div');
        activeDataSourcePanelContainer.className = 'cesium-dataSourceBrowser-activeDataSourcePanelContainer';
        activeDataSourcePanelContainer.setAttribute('data-bind', '\
style : { maxHeight : dataSourceBrowserViewModel.maxHeightOffset(45) },\
template : { if: activeDataSourcePanel,\
             name: activeDataSourcePanel && activeDataSourcePanel.templateID,\
             data: activeDataSourcePanel && activeDataSourcePanel.viewModel }');
        dataSourcePanelContainer.appendChild(activeDataSourcePanelContainer);

        var dataSourcePanelFooter = document.createElement('div');
        dataSourcePanelFooter.className = 'cesium-dataSourceBrowser-dataSourcePanelContainer-footer';
        dataSourcePanelContainer.appendChild(dataSourcePanelFooter);

        var finishAddDataSourceButton = document.createElement('span');
        finishAddDataSourceButton.className = 'cesium-dataSourceBrowser-button';
        finishAddDataSourceButton.textContent = 'OK';
        finishAddDataSourceButton.setAttribute('data-bind', '\
click: finishCommand,\
enable: finishCommand.canExecute');
        dataSourcePanelFooter.appendChild(finishAddDataSourceButton);

        var cancelAddDataSourceButton = document.createElement('span');
        cancelAddDataSourceButton.className = 'cesium-dataSourceBrowser-button';
        cancelAddDataSourceButton.textContent = 'Cancel';
        cancelAddDataSourceButton.setAttribute('data-bind', '\
click: cancelCommand,\
enable: cancelCommand.canExecute');
        dataSourcePanelFooter.appendChild(cancelAddDataSourceButton);

        var finishAddDataSourceError = document.createElement('span');
        finishAddDataSourceError.setAttribute('data-bind', '\
visible: error !== "",\
text: error');
        dataSourcePanelFooter.appendChild(finishAddDataSourceError);

        container.appendChild(element);
        this._element = element;

        knockout.applyBindings(viewModel, element);
    };

    defineProperties(DataSourceBrowser.prototype, {
        /**
         * Gets the parent container.
         * @memberof DataSourceBrowser.prototype
         *
         * @type {Element}
         */
        container : {
            get : function() {
                return this._container;
            }
        },

        /**
         * Gets the view model.
         * @memberof DataSourceBrowser.prototype
         *
         * @type {DataSourceBrowserViewModel}
         */
        viewModel : {
            get : function() {
                return this._viewModel;
            }
        }
    });

    /**
     * @memberof DataSourceBrowser
     * @returns {Boolean} true if the object has been destroyed, false otherwise.
     */
    DataSourceBrowser.prototype.isDestroyed = function() {
        return false;
    };

    /**
     * Destroys the widget.  Should be called if permanently
     * removing the widget from layout.
     * @memberof DataSourceBrowser
     */
    DataSourceBrowser.prototype.destroy = function() {
        var container = this._container;
        knockout.cleanNode(container);
        container.removeChild(this._element);
        return destroyObject(this);
    };

    return DataSourceBrowser;
});