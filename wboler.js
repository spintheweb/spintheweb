/*!
 * wboler - webbaselet for managing webbases
 * Copyright(c) 2017 Giancarlo Trevisan
 * MIT Licensed
 */
'use strict';

let stw = {};
require('./elements')(stw);
require('./contents')(stw);

module.exports = (webbase) => {
    let wboler, select;

    wboler = new stw.Area('wboler')
        .grant('developers', true);

    select = '<select>';
    for (let user in webbase.users)
        select += `<option>${user}</option>`;
    select += '</select>';
    wboler.add(new stw.Tabs('Structure', `\\s('caption="Structure" header="<i class='fas fa-fw fa-eye'></i> ${select}"')`)
        .grant('developers', true)
        .section('sidebar', 1)
        .add(new stw.Tree('<i class="fa fa-globe" title="Webbase"></i><span> Webbase</span>'))
        .add(new stw.Text('<i class="fa fa-database" title="Datasources"></i><span> Datasources</span>', 'Datasources'))
        .add(new stw.Text('<i class="fa fa-folder" title="File system"></i><span> Files</span>', 'Files'))
        .add(new stw.Text('<i class="fa fa-shield" title="Security"></i><span> Security</span>', 'Security'))
    );
    wboler.add(new stw.Tabs('Properties', `\\s('caption="Properties" visible="@id"')`)
        .grant('developers', true)
        .section('sidebar', 2)
        .add(new stw.Form('<i class="fa fa-cog" title="Properties"></i><span> General</span>', `l('Name')e\\nl('Position')e\\ne\\nl('Type')d('')\\nl('Datasource')e\\nl('Query')m\\nl('Parameters')e\\nl('Layout')m\\nb(';Save')`))
        .add(new stw.List('<i class="fas fa-eye" title="Visibility"></i><span> Visibility</span>', `t('Visibility')`))
        .add(new stw.Form('<i class="fas fa-code" title="Code behind"></i><span> Code behind</span>', `m\\a('style="width:100%; height:100%"')`))
    );

    // https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
    select = '<select>'
    for (let lang of ['en', 'it'])
        select += `<option>${lang}</option>`;
    select += '</select>';
    wboler.add(new stw.Text('Languages', `&nbsp;<i class='fas fa-fw fa-language'></i> ${select}`)
        .grant('guests', true)
        .section('header', 0)
    );

    webbase.add(wboler);
};
