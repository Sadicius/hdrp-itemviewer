
--[[ 
RegisterNetEvent('rsg-adminmenu:client:giveitem', function(data)
    local option = {}

    for k, v in pairs(RSGCore.Shared.Items) do
        local content = { value = v.name, label = v.label }
        option[#option + 1] = content
    end

    table.sort(option, compareNames)

    local item = lib.inputDialog(locale('cl_client_132'), {
        { type = 'select', options = option, label = locale('cl_client_133'), required = true },
        { type = 'number', label = locale('cl_client_134'), required = true }
    })
    if not item then return end

    TriggerServerEvent('rsg-adminmenu:server:giveitem', data.id, item[1], item[2])

end) ]]
local RSGCore = exports['rsg-core']:GetCoreObject()
lib.locale()

RegisterCommand('openitemviewer', function()
    TriggerServerEvent('hdrp-itemviewer:getItems')
end)

RegisterNetEvent('hdrp-itemviewer:receiveItems', function(items)
    local processedItems = {}
    for key, item in pairs(items) do
        item.imageUrl = "nui://"..Config.Image..RSGCore.Shared.Items[key].image
        processedItems[key] = item
    end

    SetNuiFocus(true, true)
    SendNUIMessage({ action = 'open' })
    SendNUIMessage({
        action = 'loadItems',
        items = processedItems,
        options = Config.Options
    })
end)

RegisterNUICallback('close', function(_, cb)
    SetNuiFocus(false, false)
    cb({})
end)

local function HasAdminPerms(callback)
    lib.callback('hdrp-itemviewer:checkAdmin', false, function(isAdmin)
        callback(isAdmin)
    end)
end

local tempItemData = nil

RegisterNUICallback('giveItem', function(data, cb)
    tempItemData = data
    HasAdminPerms(function(isAdmin)
        if not isAdmin then
            lib.notify({ type = 'error', description = 'No tienes permisos para usar esta función.' })
            return
        end

        SetNuiFocus(false, false)
        SendNUIMessage({ action = 'close' })

        TriggerServerEvent('hdrp-itemviewer:requestPlayers')
    end)
    cb({})
end)

RegisterNetEvent('hdrp-itemviewer:receivePlayers', function(players)
    if not players or #players == 0 then
        lib.notify({ type = 'error', description = 'No hay jugadores disponibles.' })
        return
    end

    local options = {}
    for _, player in ipairs(players) do
        table.insert(options, {
            label = string.format("[%s] %s", player.id, player.name),
            value = player.id
        })
    end

    local result = lib.inputDialog('Seleccionar jugador', {
        { type = 'select', label = 'Jugador', options = options, required = true },
        { type = 'number', label = 'Cantidad', required = true }
    })

    if result then
        local targetId = tonumber(result[1])
        local targetAmount = tonumber(result[2])
        if tempItemData then
            TriggerServerEvent('hdrp-itemviewer:server:giveitem', targetId, tempItemData.itemName, targetAmount or 1 )
            lib.notify({ type = 'success', description = 'Ítem enviado correctamente.' })
        end
    end

    tempItemData = nil
end)