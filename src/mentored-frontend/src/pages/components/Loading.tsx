import React, { useEffect, useState } from 'react';
import '../../assets/css/loading.css';

import {
    CircularProgress,
} from '@material-ui/core';

interface Props {
    insideTable: boolean;
}

const Loading: React.FC<Props> = ({ insideTable }) => {

    return insideTable ? (
        <tr>
            <td colSpan='4' className="text-center">
                <CircularProgress />
            </td>
        </tr>
    ) : (
        <div className="table-container col-md-12">
            <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}
            >
            <CircularProgress />
            </div>
        </div>
    );
};

export default Loading;