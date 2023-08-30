import React from 'react'

export function createApp(fileTree) {
    return (
        <div>
            {
                fileTree.forEach((file) => {
                    return <FileEntry file={file}></FileEntry>
                })
            }
        </div>
    )
}

function FileEntry({file}) {
    return (
        <div> 
            <p style={{ border: '2rem', borderRadius: '5rem', margin: '3rem' }}> {file.name} </p>
        </div> 
    )
}