local RSGCore = exports['rsg-core']:GetCoreObject()
lib.locale()

RegisterNetEvent('hdrp-itemviewer:getItems', function()
    local src = source
    local items = RSGCore.Shared.Items
    TriggerClientEvent('hdrp-itemviewer:receiveItems', src, items)
end)

lib.callback.register('hdrp-itemviewer:checkAdmin', function(source)
    local Player = RSGCore.Functions.GetPlayer(source)
    if not Player then return false end
    -- ✅ AJUSTA ESTE BLOQUE SEGÚN TU SISTEMA DE PERMISOS
    local hasPerm = RSGCore.Functions.HasPermission(source, 'admin')
    return hasPerm
end)

RegisterNetEvent('hdrp-itemviewer:requestPlayers', function()
    local src = source
    local players = {}

    for _, playerId in ipairs(GetPlayers()) do
        local targetSrc = tonumber(playerId)
        local targetPlayer = RSGCore.Functions.GetPlayer(targetSrc)
        if targetPlayer then
            local charinfo = targetPlayer.PlayerData.charinfo or {}
            table.insert(players, {
                id = targetSrc,
                name = (charinfo.firstname or "John") .. " " .. (charinfo.lastname or "Doe")
            })
        end
    end

    TriggerClientEvent('hdrp-itemviewer:receivePlayers', src, players)
end)

RegisterNetEvent('hdrp-itemviewer:server:giveitem', function(targetId, itemName, amount)
    local src = source
    local Player = RSGCore.Functions.GetPlayer(src)
    local Player_a = RSGCore.Functions.GetPlayer(targetId)
    if not Player_a then return end
    local firstname = Player.PlayerData.charinfo.firstname
    local lastname = Player.PlayerData.charinfo.lastname
    local citizenid = Player.PlayerData.citizenid

    if Player_a.Functions.AddItem(itemName, amount or 1) then
        TriggerClientEvent('ox_lib:notify', src, {title = "Objeto Dado", description = "objeto enviado con éxito", type = 'inform' })
    else
        TriggerEvent('rsg-log:server:CreateLog', 'adminmenu', "Uso No Autorizado", 'red', firstname..' '..lastname..' ' .. "con ID de ciudadano de" .. ' '..citizenid..' ' .. "aviso por intentar usar giveitem de admin", true)
        TriggerClientEvent('ox_lib:notify', src, {title = "No Permitido", description = "¡no tienes permitido hacer eso!", type = 'inform' })
    end
end)