import React from 'react';
import {Route, IndexRedirect} from 'react-router';
import E404 from 'root/E404';
import rootNav from 'root/rootNav';

import monitorCard from 'root/monitorCard';
import monitorCardStatus from 'root/monitorCard/monitorCardStatus';

import masterCard from 'root/masterCard';
import masterCardStatus from 'root/masterCard/masterCardStatus';
import masterCardInfo from 'root/masterCard/Info';
import masterCardOutInfo from 'root/masterCard/OutputInfo';
import masterCardSys from 'root/masterCard/SystemManagement';


import transcodeCard from 'root/transcodeCard';
import transcodeCardStatus from 'root/transcodeCard/transcodeCardStatus';
import transcodeCardParam from 'root/transcodeCard/Settings';
import transcodeCardOSD from 'root/transcodeCard/OSD';
import transcodeCardSys from 'root/transcodeCard/SystemManagement';

import demodulationCard from 'root/demodulationCard';
import demodulationCardStatus from 'root/demodulationCard/demodulationCardStatus';
import demodulationCardParam from 'root/demodulationCard/Settings';
import demodulationCardICInfo from 'root/demodulationCard/ICInfo';
import demodulationCardDecrypt from 'root/demodulationCard/Decrypt';
import demodulationCardSys from 'root/demodulationCard/SystemManagement';

import linkCard from 'root/linkCard';
import linkCardStatus from 'root/linkCard/linkCardStatus';

// 路由表
export default (
    <Route path="/" component={rootNav}>
        <IndexRedirect to="/monitorCard"/>
        <Route path="monitorCard" component={monitorCard}>
            <IndexRedirect to="/monitorCard/status"/>
            <Route path="status" component={monitorCardStatus}/>
        </Route>
        <Route path="masterCard" component={masterCard}>
            <IndexRedirect to="/masterCard/status"/>
            <Route path="status" component={masterCardStatus}/>
            <Route path="info" component={masterCardInfo}/>
            <Route path="outputinfo" component={masterCardOutInfo}/>
            <Route path="system" component={masterCardSys}/>
        </Route>
        <Route path="transcodeCard" component={transcodeCard}>
            <IndexRedirect to="/transcodeCard/status"/>
            <Route path="status" component={transcodeCardStatus}/>
            <Route path="param" component={transcodeCardParam}/>
            <Route path="osd" component={transcodeCardOSD}/>
            <Route path="system" component={transcodeCardSys}/>
        </Route>
        <Route path="demodulationCard" component={demodulationCard}>
            <IndexRedirect to="/demodulationCard/status"/>
            <Route path="status" component={demodulationCardStatus}/>
            <Route path="param" component={demodulationCardParam}/>
            <Route path="icinfo" component={demodulationCardICInfo}/>
            <Route path="decrypt" component={demodulationCardDecrypt}/>
            <Route path="system" component={demodulationCardSys}/>
        </Route>
        <Route path="linkCard" component={linkCard}>
            <IndexRedirect to="/linkCard/status"/>
            <Route path="status" component={linkCardStatus}/>
        </Route>
        <Route path="*" component={E404}/>
    </Route>
);